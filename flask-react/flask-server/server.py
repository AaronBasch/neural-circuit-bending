
import tensorflow as tf

import numpy as np

import librosa
import librosa.display
import gin

import soundfile as sf
import ddsp.training
import ddsp

from tensorflow.python.ops.numpy_ops import np_config
np_config.enable_numpy_behavior()
import matplotlib.pyplot as plt
from scipy import signal
from scipy.io import wavfile
import warnings
warnings.filterwarnings("ignore")

ddsp.spectral_ops.reset_crepe()

## Helper functions.
def shift_ld(audio_features, ld_shift=0.0):
  """Shift loudness by a number of ocatves."""
  audio_features['loudness_db'] += ld_shift
  return audio_features

def shift_f0(audio_features, pitch_shift=0.0):
  """Shift f0 by a number of ocatves."""
  audio_features['f0_hz'] *= 2.0 ** (pitch_shift)
  audio_features['f0_hz'] = np.clip(audio_features['f0_hz'], 
                                    0.0, 
                                    librosa.midi_to_hz(110.0))
  return audio_features

def setInstrument(instrument):
    global trans_path
    if instrument == 'VIOLA':
        audio = VIOLA_audio
        trans_path = VIOLA_trans_path
    elif instrument == 'KEYS':
        audio = KEYS_audio
        trans_path = KEYS_trans_path
    elif instrument == 'VOX':
        audio = VOX_audio
        trans_path = VOX_trans_path

    if len(audio.shape) == 1:
        audio = audio[np.newaxis, :]

    audio_features = ddsp.training.metrics.compute_audio_features(audio)
    audio_features['loudness_db'] = audio_features['loudness_db'].astype(np.float32)
    audio_features_mod = None

    gin_file = 'Flute2021New/operative_config-0.gin'

    with gin.unlock_config():
        gin.parse_config_file(gin_file, skip_unknown=True)

    # Ensure dimensions and sampling rates are equal
    time_steps_train = gin.query_parameter('F0LoudnessPreprocessor.time_steps')
    n_samples_train = gin.query_parameter('Harmonic.n_samples')
    hop_size = int(n_samples_train / time_steps_train)


    time_steps = int(audio.shape[1] / hop_size)
    n_samples = time_steps * hop_size

    gin_params = [
        'Harmonic.n_samples = {}'.format(n_samples),
        'FilteredNoise.n_samples = {}'.format(n_samples),
        'F0LoudnessPreprocessor.time_steps = {}'.format(time_steps),
        'oscillator_bank.use_angular_cumsum = True',  # Avoids cumsum accumulation errors.
    ]

    with gin.unlock_config():
        gin.parse_config(gin_params)

    # Trim all input vectors to correct lengths 
    for key in ['f0_hz', 'f0_confidence', 'loudness_db']:
        audio_features[key] = audio_features[key][:time_steps]
    audio_features['audio'] = audio_features['audio'][:, :n_samples]

    pitch_shift =  0 
    loudness_shift = 0 
    audio_features_mod = {k: v for k, v in audio_features.items()}


    # Manual Shifts.
    audio_features_mod = shift_ld(audio_features_mod, loudness_shift)
    audio_features_mod = shift_f0(audio_features_mod, pitch_shift)


    af = audio_features if audio_features_mod is None else audio_features_mod
    return af, audio_features

def mult_transform(LAYERS, model):
    # global af
    # global audio_features
    layer_map = {'DENSE_0':0,
                'DENSE_1':4,
                'DENSE_2':8,
                'DENSE_3':12,
                'DENSE_4':16,
                'DENSE_5':20,
                'GRU_6':24,
                'DENSE_7':27,
                'DENSE_8':31,
                'DENSE_9':35,
                'DENSE_10':39}
    # if instrument == 'VIOLA':
    #     audio_features = VIOLA_audio_features
    #     af = VIOLA_af
    # elif instrument == 'KEYS':
    #     audio_features = KEYS_audio_features
    #     af = KEYS_af
    # else:
    #     audio_features = VOX_audio_features
    #     af = VOX_af
    
    # model = ddsp.training.models.Autoencoder()
    # model.restore(ckpt)
    # _ = model(audio_features, training=False)
    for layer in layer_map:
        # model.layers[1].weights[ layer_map[layer] ].assign( OG_LAYERS[ layer_map[layer] ] )

        if LAYERS[layer]['WEIGHTS']['transform'] == 'multiply':
            model.layers[1].weights[ layer_map[layer] ].assign(
                        tf.math.scalar_mul( float(LAYERS[layer]['WEIGHTS']['operand']), model.layers[1].weights[ layer_map[layer] ]))
        elif LAYERS[layer]['WEIGHTS']['transform'] == 'shuffle':
            model.layers[1].weights[ layer_map[layer] ].assign(
                        tf.random.shuffle( model.layers[1].weights[ layer_map[layer] ]))
        elif LAYERS[layer]['WEIGHTS']['transform'] == 'inverse':
            model.layers[1].weights[ layer_map[layer] ].assign(
                        tf.math.reciprocal_no_nan( model.layers[1].weights[ layer_map[layer] ]))
        elif LAYERS[layer]['WEIGHTS']['transform'] == 'zero':
            model.layers[1].weights[ layer_map[layer] ].assign(
                        tf.math.scalar_mul( 0, model.layers[1].weights[ layer_map[layer] ]))
        elif LAYERS[layer]['WEIGHTS']['transform'] == 'identity':
            model.layers[1].weights[ layer_map[layer] ].assign(
                        tf.ones( model.layers[1].weights[ layer_map[layer] ].shape, dtype=tf.dtypes.float32 ))
        elif LAYERS[layer]['WEIGHTS']['transform'] == 'random':
            min = float(LAYERS[layer]['WEIGHTS']['min'])
            max = float(LAYERS[layer]['WEIGHTS']['max'])
            if max<min: max = min + 1
            shape = model.layers[1].weights[ layer_map[layer] ].shape
            model.layers[1].weights[ layer_map[layer] ].assign(
                        tf.random.uniform(shape, min, max, tf.float32))
                        


        if LAYERS[layer]['BIASES']['transform'] == 'multiply':
            if layer!='GRU_6':
                model.layers[1].weights[ layer_map[layer]+1 ].assign(
                            tf.math.scalar_mul( float(LAYERS[layer]['BIASES']['operand']), model.layers[1].weights[ layer_map[layer]+1 ]))
            
            else:
                model.layers[1].weights[ layer_map[layer]+2 ].assign(
                            tf.math.scalar_mul( float(LAYERS[layer]['WEIGHTS']['operand']), model.layers[1].weights[ layer_map[layer]+2 ]))
        elif LAYERS[layer]['BIASES']['transform'] == 'shuffle':
            if layer!='GRU_6':
                model.layers[1].weights[ layer_map[layer]+1 ].assign(
                            tf.random.shuffle( model.layers[1].weights[ layer_map[layer]+1 ]))
            else:
                model.layers[1].weights[ layer_map[layer]+2 ].assign(
                            tf.random.shuffle( model.layers[1].weights[ layer_map[layer]+2 ]))
        elif LAYERS[layer]['BIASES']['transform'] == 'inverse':
            if layer!='GRU_6':
                model.layers[1].weights[ layer_map[layer]+1 ].assign(
                            tf.math.reciprocal_no_nan( model.layers[1].weights[ layer_map[layer]+1 ]))
            else:
                model.layers[1].weights[ layer_map[layer]+2 ].assign(
                            tf.math.reciprocal_no_nan( model.layers[1].weights[ layer_map[layer]+2 ]))
        elif LAYERS[layer]['BIASES']['transform'] == 'zero':
            if layer!='GRU_6':
                model.layers[1].weights[ layer_map[layer]+1 ].assign(
                            tf.math.scalar_mul( 0, model.layers[1].weights[ layer_map[layer]+1 ]))
            else:
                model.layers[1].weights[ layer_map[layer]+2 ].assign(
                            tf.math.scalar_mul( 0, model.layers[1].weights[ layer_map[layer]+2 ]))
        elif LAYERS[layer]['BIASES']['transform'] == 'identity':
            if layer!='GRU_6':
                model.layers[1].weights[ layer_map[layer]+1 ].assign(
                            tf.ones( model.layers[1].weights[ layer_map[layer]+1 ].shape, dtype=tf.dtypes.float32))
            else:
                model.layers[1].weights[ layer_map[layer]+2 ].assign(
                            tf.ones( model.layers[1].weights[ layer_map[layer]+2 ].shape, dtype=tf.dtypes.float32))
        elif LAYERS[layer]['BIASES']['transform'] == 'random':
            min = float(LAYERS[layer]['BIASES']['min'])
            max = float(LAYERS[layer]['BIASES']['max'])
            if max<min: max = min + 1
            if layer!='GRU_6':
                model.layers[1].weights[ layer_map[layer]+1 ].assign(
                            tf.random.uniform( model.layers[1].weights[ layer_map[layer]+1 ].shape, min, max, tf.float32))
            else:
                model.layers[1].weights[ layer_map[layer]+2 ].assign(
                            tf.random.uniform( model.layers[1].weights[ layer_map[layer]+2 ].shape, min, max, tf.float32))
        

        if layer == 'GRU_6':
            if LAYERS[layer]['RECURRENT']['transform'] == 'multiply':
                model.layers[1].weights[ layer_map[layer]+1 ].assign(
                            tf.math.scalar_mul( float(LAYERS[layer]['RECURRENT']['operand']), model.layers[1].weights[ layer_map[layer]+1 ]))
            elif LAYERS[layer]['RECURRENT']['transform'] == 'shuffle':
                model.layers[1].weights[ layer_map[layer]+1 ].assign(
                            tf.random.shuffle( model.layers[1].weights[ layer_map[layer]+1 ]))
            elif LAYERS[layer]['RECURRENT']['transform'] == 'inverse':
                model.layers[1].weights[ layer_map[layer]+1 ].assign(
                            tf.math.reciprocal_no_nan( model.layers[1].weights[ layer_map[layer]+1 ]))
            elif LAYERS[layer]['RECURRENT']['transform'] == 'zero':
                model.layers[1].weights[ layer_map[layer]+1 ].assign(
                            tf.math.scalar_mul( 0, model.layers[1].weights[ layer_map[layer]+1 ]))
            elif LAYERS[layer]['RECURRENT']['transform'] == 'identity':
                model.layers[1].weights[ layer_map[layer]+1 ].assign(
                            tf.ones( model.layers[1].weights[ layer_map[layer]+1 ].shape, dtype=tf.dtypes.float32))
            elif LAYERS[layer]['RECURRENT']['transform'] == 'random':
                min = float(LAYERS[layer]['RECURRENT']['min'])
                max = float(LAYERS[layer]['RECURRENT']['max'])
                if max<min: max = min + 1
                model.layers[1].weights[ layer_map[layer]+1 ].assign(
                            tf.random.uniform( model.layers[1].weights[ layer_map[layer]+1 ].shape, min, max, tf.float32))
    # return model

def originalLayers():
    originalDecoder = []
    for i in range(len(model.layers[1].weights)):
        originalDecoder.append(tf.Variable( model.layers[1].weights[i].numpy , shape=tf.shape(model.layers[1].weights[i])))
    return originalDecoder

def saveSpec(samples,sample_rate,dest_path):
    # sample_rate, samples = wavfile.read(src_path)
    x, sr = samples, sample_rate

    window_size = 1024
    hop_length = 512 
    n_mels = 128
    time_steps = 384 

    window = np.hanning(window_size)
    stft= librosa.core.spectrum.stft(x, n_fft = window_size, hop_length = hop_length, window=window)
    out = 2 * np.abs(stft) / np.sum(window)

    plt.figure(figsize=(4, 4))
    ax = plt.axes()
    plt.set_cmap('hot')
    img = librosa.display.specshow(librosa.amplitude_to_db(out, ref=np.max), y_axis='log', x_axis='time',sr=sr)
    plt.savefig(dest_path, bbox_inches='tight', transparent=True, pad_inches=0.0 )
    plt.close()
    # frequencies, times, spectrogram = signal.spectrogram(samples, sample_rate)

    # plt.pcolormesh(times, frequencies, spectrogram)
    # plt.imshow(spectrogram)
    # plt.ylabel('Frequency [Hz]')
    # plt.xlabel('Time [sec]')
    # plt.savefig(dest_path,format='jpg')

SR = 16000

ckpt = 'Flute2021New'

VIOLA_audio, sr = librosa.load('/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/viola_sustained_original.mp3', sr=SR)
VIOLA_trans_path = '/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/viola_sustained_transformed.wav'
VIOLA_og_spec = '/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/viola_sustained_original_spec.jpg'
VIOLA_trans_spec = '/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/viola_sustained_transformed_spec.jpg'
saveSpec(VIOLA_audio, sr,VIOLA_og_spec)
VIOLA_af, VIOLA_audio_features = setInstrument('VIOLA')
VIOLA_model = ddsp.training.models.Autoencoder()
VIOLA_model.restore(ckpt)
_ = VIOLA_model(VIOLA_audio_features, training=False)

KEYS_audio, sr = librosa.load('/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/piano_c5_original.wav', sr=SR)
KEYS_trans_path = '/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/piano_c5_transformed.wav'
KEYS_og_spec = '/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/keys_sustained_original_spec.jpg'
KEYS_trans_spec = '/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/keys_sustained_transformed_spec.jpg'
saveSpec(KEYS_audio, sr,KEYS_og_spec)
KEYS_af, KEYS_audio_features = setInstrument('KEYS')
KEYS_model = ddsp.training.models.Autoencoder()
KEYS_model.restore(ckpt)
_ = KEYS_model(KEYS_audio_features, training=False)


VOX_audio, sr = librosa.load('/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/male_choir_original.wav', sr=SR)
VOX_trans_path = '/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/male_choir_transformed.wav'
VOX_og_spec = '/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/vox_sustained_original_spec.jpg'
VOX_trans_spec = '/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/vox_sustained_transformed_spec.jpg'
saveSpec(VOX_audio, sr,VOX_og_spec)
VOX_af, VOX_audio_features = setInstrument('VOX')
VOX_model = ddsp.training.models.Autoencoder()
VOX_model.restore(ckpt)
_ = VOX_model(VOX_audio_features, training=False)

instrument = 'VIOLA'

# OG_WEIGHTS = originalLayers()
# print(OG_WEIGHTS)

# trans_path = VIOLA_trans_path
# audio = VIOLA_audio




from flask import Flask, request
import json

app = Flask(__name__)

# arr = ['']*41 #number of layers

LAYER_DATA =    {'DENSE_0':{'WEIGHTS':{'transform':'','value':0,'operand':1, 'min':0, 'max':1},
                        'BIASES':{'transform':'','value':0,'operand':1, 'min':0, 'max':1}},
                'DENSE_1':{'WEIGHTS':{'transform':'','value':0,'operand':1, 'min':0, 'max':1},
                        'BIASES':{'transform':'','value':0,'operand':1, 'min':0, 'max':1}},
                'DENSE_2':{'WEIGHTS':{'transform':'','value':0,'operand':1, 'min':0, 'max':1},
                        'BIASES':{'transform':'','value':0,'operand':1, 'min':0, 'max':1}},
                'DENSE_3':{'WEIGHTS':{'transform':'','value':0,'operand':1, 'min':0, 'max':1},
                        'BIASES':{'transform':'','value':0,'operand':1, 'min':0, 'max':1}},
                'DENSE_4':{'WEIGHTS':{'transform':'','value':0,'operand':1, 'min':0, 'max':1},
                        'BIASES':{'transform':'','value':0,'operand':1, 'min':0, 'max':1}},
                'DENSE_5':{'WEIGHTS':{'transform':'','value':0,'operand':1, 'min':0, 'max':1},
                        'BIASES':{'transform':'','value':0,'operand':1, 'min':0, 'max':1}},
                'GRU_6':{'WEIGHTS':{'transform':'','value':0,'operand':1, 'min':0, 'max':1},
                        'RECURRENT':{'transform':'','value':0,'operand':1, 'min':0, 'max':1},
                        'BIASES':{'transform':'','value':0,'operand':1, 'min':0, 'max':1}},
                'DENSE_7':{'WEIGHTS':{'transform':'','value':0,'operand':1, 'min':0, 'max':1},
                        'BIASES':{'transform':'','value':0,'operand':1, 'min':0, 'max':1}},
                'DENSE_8':{'WEIGHTS':{'transform':'','value':0,'operand':1, 'min':0, 'max':1},
                        'BIASES':{'transform':'','value':0,'operand':1, 'min':0, 'max':1}},
                'DENSE_9':{'WEIGHTS':{'transform':'','value':0,'operand':1, 'min':0, 'max':1},
                        'BIASES':{'transform':'','value':0,'operand':1, 'min':0, 'max':1}},
                'DENSE_10':{'WEIGHTS':{'transform':'','value':0,'operand':1, 'min':0, 'max':1},
                        'BIASES':{'transform':'','value':0,'operand':1, 'min':0, 'max':1}}}

json_obj = {"members": LAYER_DATA}
# members API route
@app.route("/members", methods=["GET"])
def members_get():
    return {"members": LAYER_DATA}

@app.route("/members", methods=["POST"])
def members_post():
    global LAYER_DATA
    data = request.data
    json_object = json.loads(data)
    json_obj = dict(json_object)
    LAYER_DATA = json_obj['members']
    print(json_obj)
    return {"members": LAYER_DATA}

@app.route("/reset", methods=["POST"])
def members_reset():
    if instrument=='VIOLA':
        VIOLA_model.restore(ckpt)
    elif instrument=='KEYS':
        KEYS_model.restore(ckpt)
    elif instrument=='VOX':
        VOX_model.restore(ckpt)
    print(instrument+' model has been reset!')
    return {"members": LAYER_DATA}

@app.route("/generate", methods=["POST"])
def members_generate():
    global LAYER_DATA
    data = request.data
    json_object = json.loads(data)
    json_obj = dict(json_object)
    LAYER_DATA = json_obj['members']
    print(LAYER_DATA)

    if instrument=='VIOLA':
        # VIOLA_model.restore(ckpt)
        mult_transform(LAYER_DATA,VIOLA_model)
        outputs = VIOLA_model(VIOLA_af, training=False)
        audio_gen = VIOLA_model.get_audio_from_outputs(outputs)
        trans_path = VIOLA_trans_path
        saveSpec(audio_gen.numpy()[0], SR, VIOLA_trans_spec)
    elif instrument=='KEYS':
        # KEYS_model.restore(ckpt)
        mult_transform(LAYER_DATA,KEYS_model)
        outputs = KEYS_model(KEYS_af, training=False)
        audio_gen = KEYS_model.get_audio_from_outputs(outputs)
        trans_path = KEYS_trans_path
        saveSpec(audio_gen.numpy()[0], SR, KEYS_trans_spec)
    elif instrument=='VOX':
        # VOX_model.restore(ckpt)
        mult_transform(LAYER_DATA,VOX_model)
        outputs = VOX_model(VOX_af, training=False)
        audio_gen = VOX_model.get_audio_from_outputs(outputs)
        trans_path = VOX_trans_path
        saveSpec(audio_gen.numpy()[0], SR, VOX_trans_spec)

    sf.write(trans_path, audio_gen.numpy()[0], SR, format='WAV')

    

    print("generate audio!")
    return {"members": LAYER_DATA}
    
@app.route("/upload", methods=["POST"])
def members_upload():
    global instrument
    data = request.data
    json_object = json.loads(data)
    json_obj = dict(json_object)
    data = json_obj['members']
    if data['INSTRUMENT'] != instrument:
        instrument = data['INSTRUMENT']
    print('instrument set: '+instrument)
    return {"members": data}
print('ready')

if __name__ == "__main__":
    app.run(debug=True)