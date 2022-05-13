import React, {useState, useEffect} from 'react'

import './App.css';
import axios from 'axios';

import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import 'bootstrap/dist/css/bootstrap.min.css';

import viola_trans from '/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/viola_sustained_transformed.wav';
import keys_trans from '/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/piano_c5_transformed.wav';
import vox_trans from '/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/male_choir_transformed.wav';

import viola_original from '/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/viola_sustained_original.mp3';
import keys_original from '/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/piano_c5_original.wav';
import vox_original from '/Users/aaronbasch/Desktop/ddsp_bending/neural-circuit-bending/flask-react/react-front-end/src/male_choir_original.wav';

import viola_original_spec from './viola_sustained_original_spec.jpg';
import keys_original_spec from './keys_sustained_original_spec.jpg';
import vox_original_spec from './vox_sustained_original_spec.jpg';


import viola_trans_spec from './viola_sustained_transformed_spec.jpg';
import keys_trans_spec from './keys_sustained_transformed_spec.jpg';
import vox_trans_spec from './vox_sustained_transformed_spec.jpg';



  
function App() {
  const [layers, setLayers] = useState({
    DENSE_0:{WEIGHTS:{transform:'', value:0, operand:1, min:0, max:1},
            BIASES:{transform:'', value:0, operand:1, min:0, max:1}},
    DENSE_1:{WEIGHTS:{transform:'', value:0, operand:1, min:0, max:1},
            BIASES:{transform:'', value:0, operand:1, min:0, max:1}},
    DENSE_2:{WEIGHTS:{transform:'', value:0, operand:1, min:0, max:1},
            BIASES:{transform:'', value:0, operand:1, min:0, max:1}},
    DENSE_3:{WEIGHTS:{transform:'', value:0, operand:1, min:0, max:1},
            BIASES:{transform:'', value:0, operand:1, min:0, max:1}},
    DENSE_4:{WEIGHTS:{transform:'', value:0, operand:1, min:0, max:1},
            BIASES:{transform:'', value:0, operand:1, min:0, max:1}},
    DENSE_5:{WEIGHTS:{transform:'', value:0, operand:1 , min:0, max:1},
            BIASES:{transform:'', value:0, operand:1 , min:0, max:1}},
    GRU_6:{WEIGHTS:{transform:'', value:0, operand:1 , min:0, max:1},
            RECURRENT:{transform:'', value:0, operand:1 , min:0, max:1},
            BIASES:{transform:'', value:0, operand:1 , min:0, max:1}},
    DENSE_7:{WEIGHTS:{transform:'', value:0, operand:1 , min:0, max:1},
            BIASES:{transform:'', value:0, operand:1 , min:0, max:1}},
    DENSE_8:{WEIGHTS:{transform:'', value:0, operand:1 , min:0, max:1},
            BIASES:{transform:'', value:0, operand:1 , min:0, max:1}},
    DENSE_9:{WEIGHTS:{transform:'', value:0, operand:1 , min:0, max:1},
            BIASES:{transform:'', value:0, operand:1 , min:0, max:1}},
    DENSE_10:{WEIGHTS:{transform:'', value:0, operand:1 , min:0, max:1},
            BIASES:{transform:'', value:0, operand:1 , min:0, max:1}}
  });
  const [prevLayers, setPrevLayers] = useState({
    DENSE_0:{WEIGHTS:{transform:'', value:0, operand:1, min:0, max:1},
            BIASES:{transform:'', value:0, operand:1, min:0, max:1}},
    DENSE_1:{WEIGHTS:{transform:'', value:0, operand:1, min:0, max:1},
            BIASES:{transform:'', value:0, operand:1, min:0, max:1}},
    DENSE_2:{WEIGHTS:{transform:'', value:0, operand:1, min:0, max:1},
            BIASES:{transform:'', value:0, operand:1, min:0, max:1}},
    DENSE_3:{WEIGHTS:{transform:'', value:0, operand:1, min:0, max:1},
            BIASES:{transform:'', value:0, operand:1, min:0, max:1}},
    DENSE_4:{WEIGHTS:{transform:'', value:0, operand:1, min:0, max:1},
            BIASES:{transform:'', value:0, operand:1, min:0, max:1}},
    DENSE_5:{WEIGHTS:{transform:'', value:0, operand:1 , min:0, max:1},
            BIASES:{transform:'', value:0, operand:1 , min:0, max:1}},
    GRU_6:{WEIGHTS:{transform:'', value:0, operand:1 , min:0, max:1},
            RECURRENT:{transform:'', value:0, operand:1 , min:0, max:1},
            BIASES:{transform:'', value:0, operand:1 , min:0, max:1}},
    DENSE_7:{WEIGHTS:{transform:'', value:0, operand:1 , min:0, max:1},
            BIASES:{transform:'', value:0, operand:1 , min:0, max:1}},
    DENSE_8:{WEIGHTS:{transform:'', value:0, operand:1 , min:0, max:1},
            BIASES:{transform:'', value:0, operand:1 , min:0, max:1}},
    DENSE_9:{WEIGHTS:{transform:'', value:0, operand:1 , min:0, max:1},
            BIASES:{transform:'', value:0, operand:1 , min:0, max:1}},
    DENSE_10:{WEIGHTS:{transform:'', value:0, operand:1 , min:0, max:1},
            BIASES:{transform:'', value:0, operand:1 , min:0, max:1}}
  });

  const [instrument, setInstrument] = useState({INSTRUMENT:'VIOLA'})
  const [audio, setAudio] = useState()
  const [audioFile, setAudioFile] = useState()
  const [editedData,setEditedData] = useState()

  const transformTypes = ['','zero','inverse','shuffle','multiply','identity','random']

  const generateTransform = () => {

    const article = { 'members': layers}
    axios.post('/generate', article).then(response => article).then(
      editedData => {
        setEditedData(article)
        console.log(article)
      }
    );
  }

  function adjustInstrument(instrument_){
    // Simple POST request with a JSON body using axios
    const instData = {INSTRUMENT:instrument_}
    const article = { 'members': instData}
    setInstrument({...instData})
    axios.post('/upload', article).then(response => article).then(
      editedData => {
        setEditedData(article)
        console.log(article)
      }
    );
  }

  const getTransform = (layer_,type) => {
    const transform_ = layers[layer_][type].transform
    return (
      transform_==='multiply'? transform_+'*'+layers[layer_][type].operand: transform_
    )
    
  }

  const getAudioTransformed = () => {
    if(instrument.INSTRUMENT==='VIOLA'){
      return viola_trans
    }else if (instrument.INSTRUMENT==='KEYS'){
      return keys_trans
    }else{
      return vox_trans
    }
  }

  function resetModel() {
    const article = { 'members': 'reset'}
    axios.post('/reset', article).then(response => article).then(
      editedData => {
        setEditedData(article)
        console.log(article)
      }
    );
  }

  function postAudio() {
    const article = { 'members': audio}
    axios.post('/upload', article).then(response => article).then(
      editedData => {
        setEditedData(article)
        console.log(article)
      }
    );
  }
  
  function Upload() { 
    const handleFileSelected = (e) => {
      const files = Array.from(e.target.files)
      if (e.target.files[0]) {
        setAudio(URL.createObjectURL(e.target.files[0]));
        setAudioFile(e.target.files[0])
        postAudio()
      }
      console.log("files:", files[0].name)
    }
    
    return (
      <div>
      <input className='description' onChange={handleFileSelected} type="file" accept='.wav, .mp3'/>
      {audio&&
        <audio src={audio} controls autoplay muted style={{marginLeft:'-50px', transform: 'scale(.7)'}}/>}
      </div>
    )
  }

  const drawConnections = (width_) => {
    function numberRange (start, end) {
      return new Array(end - start).fill().map((d, i) => i + start);
    }
    const max = 5
    return (
      <svg className='connections' width={width_}>
      {numberRange(0,max+1).map((y1_) => 
          numberRange(0,max+1).map((y2_) =>
            (
              <line x1="0" x2={width_} y1={y1_*(100/max)+'%'} y2={y2_*(100/max)+'%'}  
                  style={{stroke:'grey', strokeWidth:'1px'}}/>
            )
          )
        )}
        
      </svg>
    )
  }

  const adjustOperand = (layer_,type,operand_) => {
    const new_layers = layers
    new_layers[layer_][type].operand = operand_.target.value
    setPrevLayers({...layers})
    setLayers({...new_layers})
  }

  const adjustMin = (layer_,type,min_) => {
    const new_layers = layers
    new_layers[layer_][type].min = min_.target.value
    setPrevLayers({...layers})
    setLayers({...new_layers})
  }

  const adjustMax = (layer_,type,max_) => {
    const new_layers = layers
    new_layers[layer_][type].max = max_.target.value
    setPrevLayers({...layers})
    setLayers({...new_layers})
  }

  const getSpecInput = () => {
    if(instrument.INSTRUMENT==='VIOLA'){
      return viola_original_spec
    }else if(instrument.INSTRUMENT==='KEYS'){
      return keys_original_spec
    }else if(instrument.INSTRUMENT==='VOX'){
      return vox_original_spec
    }
  }

  const getSpecOutput = () => {
    if(instrument.INSTRUMENT==='VIOLA'){
      return viola_trans_spec
    }else if(instrument.INSTRUMENT==='KEYS'){
      return keys_trans_spec
    }else if(instrument.INSTRUMENT==='VOX'){
      return vox_trans_spec
    }
  }

  const adjustValue = (layer_,type,value_) => {
    const new_layers = layers
    new_layers[layer_][type].value = value_.target.value
    setPrevLayers({...layers})
    setLayers({...new_layers})
    console.log(layers)
  }

  const clearTransforms = () => {
    const clear_trans = {
      DENSE_0:{WEIGHTS:{transform:'', value:0, operand:1},
              BIASES:{transform:'', value:0, operand:1}},
      DENSE_1:{WEIGHTS:{transform:'', value:0, operand:1},
              BIASES:{transform:'', value:0, operand:1}},
      DENSE_2:{WEIGHTS:{transform:'', value:0, operand:1},
              BIASES:{transform:'', value:0, operand:1}},
      DENSE_3:{WEIGHTS:{transform:'', value:0, operand:1},
              BIASES:{transform:'', value:0, operand:1}},
      DENSE_4:{WEIGHTS:{transform:'', value:0, operand:1},
              BIASES:{transform:'', value:0, operand:1}},
      DENSE_5:{WEIGHTS:{transform:'', value:0, operand:1},
              BIASES:{transform:'', value:0, operand:1}},
      GRU_6:{WEIGHTS:{transform:'', value:0, operand:1},
              RECURRENT:{transform:'', value:0, operand:1},
              BIASES:{transform:'', value:0, operand:1}},
      DENSE_7:{WEIGHTS:{transform:'', value:0, operand:1},
              BIASES:{transform:'', value:0, operand:1}},
      DENSE_8:{WEIGHTS:{transform:'', value:0, operand:1},
              BIASES:{transform:'', value:0, operand:1}},
      DENSE_9:{WEIGHTS:{transform:'', value:0, operand:1},
              BIASES:{transform:'', value:0, operand:1}},
      DENSE_10:{WEIGHTS:{transform:'', value:0, operand:1},
              BIASES:{transform:'', value:0, operand:1}}
    }
    setPrevLayers({...layers})
    setLayers({...clear_trans})
  }

  const undo = () => {
    setLayers({...prevLayers})
  }

  const adjustTransform = (transform_,layer_,type) => {
    const new_layers = layers
    
    if(new_layers[layer_][type].transform===transform_ || transform_==='none'){
      new_layers[layer_][type].transform = ''
    }else{
      new_layers[layer_][type].transform = transform_
    }
    setPrevLayers({...layers})
    setLayers({...new_layers})
  }

  const getColor = (transform_,layer_,type) => {
    if( layers[layer_][type].transform===transform_){
      return "rgb(119, 184, 201)"
    }else{
      return "black"
    }
  }
  const Recurrent_Layer = (layer_) => {
    return (
      ['WEIGHTS','RECURRENT','BIASES'].map((type)=>(<div className='chip'>
       
        <div className='gru' >
        
        <div className='description'>
          <div style={{position:'relative',justifyContent:'center'}}>
          <p style={{margin:'0', color:'black',fontSize:'1.2em', fontStyle:'italic', justifyContent:'center'}}>
            {type+':'}
          </p>
          {/* <input type="range" min="1" max="100" className="mainSlider" id="myRange" onChange={(val)=>adjustValue(layer_,type,val)} style={{position:'absolute', top:'0'}}/> */}
          </div>
          <select value={layers[layer_][type].transform} onChange={(e)=>{adjustTransform(e.target.value,layer_,type)}}>
          {transformTypes.map((transform_) => (
          <option className="a dropdown-item">{transform_}</option>
        ))}
          </select>
          <div>
            {layers[layer_][type].transform==='multiply'&&(<div>
              *
            <input type="number" value={layers[layer_][type].operand} style={{maxWidth:'80px',border:'0px solid #ffffff',outline:'0px solid #ffffff'}}onChange={(op)=>adjustOperand(layer_,type,op)}/>
            </div>)}
          </div>
          <div>
            {layers[layer_][type].transform==='random'&&(<div>
              min:
            <input type="number" value={layers[layer_][type].min} style={{maxWidth:'80px',border:'0px solid #ffffff',outline:'0px solid #ffffff'}}onChange={(min)=>adjustMin(layer_,type,min)}/>
            </div>)}
          </div>
          <div>
            {layers[layer_][type].transform==='random'&&(<div>
              max:
            <input type="number" value={layers[layer_][type].max} style={{maxWidth:'80px',border:'0px solid #ffffff',outline:'0px solid #ffffff'}}onChange={(max)=>adjustMax(layer_,type,max)}/>
            </div>)}
          </div>

          {/* {transformTypes.map((transform_)=>(
            <div style={{position:'relative'}}>
              <p className='transformType'
                style={{justifyContent:'center', margin:'0', color:getColor(transform_,layer_,type)}}
                onClick={()=>adjustTransform(transform_,layer_,type)}>
                  {transform_==='multiply'? transform_+'*'+layers[layer_][type].operand:transform_}
              </p>
              <div style={{position:'absolute', top:'13.5px', left:'0'}}>
              {transform_==='multiply'&&
              layers[layer_][type].transform===transform_&&<input type="range" min="-999" max="999" className="slider" id="myRange" onChange={(op)=>adjustOperand(layer_,type,op)}/>}
              </div>
              </div>
            ))} */}
            
          
        </div>
        


      </div>
      
      </div>))

    )
  }

  const Dense_Layer = (layer_) => {
    return (
      ['WEIGHTS','BIASES'].map((type)=>(<div className='chip'>

        <div className='gru'>
        <div className='description dense'>
          <div style={{position:'relative'}}>
          <p style={{margin:'0', color:'black',fontSize:'1.2em', fontStyle:'italic'}}>
            {type+':'}
          </p>
          {/* <input type="range" min="1" max="100" className="mainSlider" id="myRange" onChange={(val)=>adjustValue(layer_,type,val)} style={{position:'absolute', top:'0'}}/> */}
          </div>
          <select value={layers[layer_][type].transform} onChange={(e)=>{adjustTransform(e.target.value,layer_,type)}}>
          {transformTypes.map((transform_) => (
          <option className="a dropdown-item">{transform_}</option>
        ))}
          </select>
          <div>
            {layers[layer_][type].transform==='multiply'&&(<div>
              *
            <input type="number" value={layers[layer_][type].operand} style={{maxWidth:'80px',border:'0px solid #ffffff',outline:'0px solid #ffffff'}}onChange={(op)=>adjustOperand(layer_,type,op)}/>
            </div>)}
          </div>
          <div>
            {layers[layer_][type].transform==='random'&&(<div>
              min:
            <input type="number" value={layers[layer_][type].min} style={{maxWidth:'80px',border:'0px solid #ffffff',outline:'0px solid #ffffff'}}onChange={(min)=>adjustMin(layer_,type,min)}/>
            </div>)}
          </div>
          <div>
            {layers[layer_][type].transform==='random'&&(<div>
              max:
            <input type="number" value={layers[layer_][type].max} style={{maxWidth:'80px',border:'0px solid #ffffff',outline:'0px solid #ffffff'}}onChange={(max)=>adjustMax(layer_,type,max)}/>
            </div>)}
          </div>

          {/* <Dropdown>
        <Dropdown.Toggle  id="dropdown-basic">
        {getTransform(layer_,type)}
        </Dropdown.Toggle>

        <Dropdown.Menu>
        {transformTypes.map((transform_) => (
          <Dropdown.Item className="a dropdown-item" onClick = {() => adjustTransform(transform_,layer_,type)}>{transform_}</Dropdown.Item>
        ))}
          
          
        </Dropdown.Menu>
        <div >
          {layers[layer_][type].transform==='multiply'&&
          <input type="range" min="-999" max="999" className="slider" id="myRange" onChange={(op)=>adjustOperand(layer_,type,op)}/>}
        </div>
      </Dropdown> */}
          {/* {transformTypes.map((transform_)=>(
            <div style={{position:'relative'}}>
              <p className='transformType'
                style={{ margin:'0', color:getColor(transform_,layer_,type)}}
                onClick={()=>adjustTransform(transform_,layer_,type)}>
                 {transform_==='multiply'? transform_+'*'+layers[layer_][type].operand:transform_}
              </p>
              <div style={{position:'absolute', top:'13.5px', left:'0'}}>
              {transform_==='multiply'&&
              layers[layer_][type].transform===transform_&&<input type="range" min="-999" max="999" className="slider" id="myRange" onChange={(op)=>adjustOperand(layer_,type,op)}/>}
              </div>
              </div>
            ))} */}
            
          
        </div>
        


      </div>
      
      </div>))

    )
  }

  return (
    <div style={{background: 'white', height: '100vh', marginTop: '50px',
    minHeight : '100vh'}}>
      <Container>
        <Row>
          
          <Col md={3} className='sidebar'>
              <p className='description title'>
                Network Bending
              </p>
              <p className='description subtitle'>
                INPUT:
              </p>
              <div >
                <div style={{position:'relative'}}>
                <button style={{backgroundColor:instrument.INSTRUMENT==='VIOLA'?'rgb(119, 184, 201)':'rgb(240,240,240)', position:'absolute',left:'50px',top:'17px',height:'20px',width:'50px'}}className='description' onClick={() => adjustInstrument('VIOLA')} variant={'Gen'}>VIOLA</button>
                <audio src={viola_original}  controls style={{marginLeft:'50px',transform:'scale(.5)'}}/>
                </div>
                <div style={{position:'relative'}}>
                <button style={{backgroundColor:instrument.INSTRUMENT==='KEYS'?'rgb(119, 184, 201)':'rgb(240,240,240)', position:'absolute',left:'50px',top:'17px',height:'20px',width:'50px'}}className='description' onClick={() => adjustInstrument('KEYS')} variant={'Gen'}>KEYS</button>
                <audio src={keys_original}  controls style={{marginLeft:'50px',transform:'scale(.5)'}}/>
                </div>
                <div style={{position:'relative'}}>
                <button style={{backgroundColor:instrument.INSTRUMENT==='VOX'?'rgb(119, 184, 201)':'rgb(240,240,240)', position:'absolute',left:'50px',top:'17px',height:'20px',width:'50px'}}className='description' onClick={() => adjustInstrument('VOX')} variant={'Gen'}>VOX</button>
                <audio src={vox_original}  controls style={{marginLeft:'50px',transform:'scale(.5)'}}/>
                </div>
            
              </div>

              <p className='description subtitle'>
                OUTPUT:
              </p>
              <div>
                <div style={{position:'relative'}}>
                <button style={{position:'absolute',left:'50px',top:'17px',height:'20px',width:'50px'}}className='description' onClick={() => generateTransform()}>APPLY</button>
                <audio src={getAudioTransformed()}  controls style={{marginLeft:'50px',transform:'scale(.5)'}}/>
                
                </div>
                <div>
                <button style={{height:'20px',width:'150px'}} className='description' onClick={() => resetModel()}>reset model</button>
                </div>
                <div>
                <button style={{height:'20px',width:'150px'}} className='description' onClick={() => clearTransforms()}>clear transforms</button>
                </div>
                <div>
                <button style={{height:'20px',width:'50px'}} className='description' onClick={() => undo()}>undo</button>
                </div>
              </div>

              
          </Col>

          <Col>
          
            <div className='circuit_board' style={{justifyContent:'center'}}>
            <div style={{display:'flex',flexWrap:'wrap',marginTop:'20px',marginBottom:'20px'}}>
  
            {/* <div className='layer input' >
            
            </div>
            {drawConnections(150)} */}
            </div>
            <div className='layer' style={{justifyContent:'center',display:'flex',flexWrap:'wrap',marginTop:'20px'}}>
            <div className='gru' style={{justifyContent:'center',maxWidth:'150px',maxHeight:'150px'}}>
              <img src={getSpecInput()} style={{maxWidth:'150px',maxHeight:'150px'}}/>
              
            </div></div>
            <div style={{justifyContent:'center',maxWidth:'150px',maxHeight:'150px',marginTop:'20px'}}>
            {drawConnections(100)}
            </div>
            
                {Object.keys(layers).map((layer_)=>(
                  <div style={{justifyContent:'center',display:'flex',flexWrap:'wrap',marginTop:'20px'}}>
                  <div className='layer' style={{justifyContent:'center'}}>
                    <p className='description' style={{margin:'0', color:'black',fontSize:'1.5em'}}>{layer_}</p>
                    <div className='break'></div>
                    {layer_.slice(0, 5)==='DENSE'? 
                        Dense_Layer(layer_):Recurrent_Layer(layer_)

                        }
                    </div>
                    {layer_!=='OUTPUT' && drawConnections(100)}
                    </div>
                  
                ))}
               
              {/* <p className='break'></p> */}
              
              <div className='layer' style={{justifyContent:'center',display:'flex',flexWrap:'wrap',marginTop:'20px'}}>
            <div className='gru' style={{justifyContent:'center',maxWidth:'150px',maxHeight:'150px'}}>
              <img src={getSpecOutput()} style={{maxWidth:'150px',maxHeight:'150px'}}/>
              
            </div></div>
            </div>
            
          </Col>
        
        </Row>
      </Container>
    </div>
  )
}

export default App