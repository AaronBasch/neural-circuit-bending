from flask import Flask, request
import json

app = Flask(__name__)

arr = ['']*20 #number of layers
json_obj = {"members": arr}
# members API route
@app.route("/members", methods=["GET"])
def members_get():
    return {"members": arr}

@app.route("/members", methods=["POST"])
def members_post():
    global arr
    data = request.data
    json_object = json.loads(data)
    json_obj = dict(json_object)
    arr = json_obj['members']
    print(json_obj)
    return {"members": arr}

if __name__ == "__main__":
    app.run(debug=True)