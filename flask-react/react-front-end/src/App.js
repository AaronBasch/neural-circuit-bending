import React, {useState, useEffect} from 'react'
import axios from 'axios';
import Dropdown from 'react-bootstrap/Dropdown'
import Button from 'react-bootstrap/Button'
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {

  const [data,setData] = useState([{}])
  const [editedData,setEditedData] = useState([{}])
  const [transform, setTransform] = useState('')

  useEffect(() => {
    fetch("/members").then(
      res => res.json()
    ).then(
      data => {
        setData(data)
        console.log(data)
      }
    )
  },[editedData])

  const editArr = (i) => {
    // Simple POST request with a JSON body using axios
    const article = { 'members': data.members}
    article.members[i] = transform
    axios.post('/members', article).then(response => article).then(
      editedData => {
        setEditedData(article)
        console.log(article)
      }
    );
  }

  const adjustTransform = (type) => {
    setTransform(type)
  }

  const generateTransform = () => {
    // Simple POST request with a JSON body using axios
    const article = { 'members': data.members}

    axios.post('/generate', article).then(response => article).then(
      editedData => {
        setEditedData(article)
        console.log(article)
      }
    );
  }

  return (
    <div>
      <style type="text/css">
    {`
    .btn-Gate {
      background-color: #42b5d4;
      margin-left: 10px;
      margin-top: 10px;
      font-size: 25px;
      justify-content: space-between; 
      min-height: 50px;
      min-width: 50px;
    }
    .btn-Inv {
      background-color: #b879ed;
      margin-left: 10px;
      margin-top: 10px;
      font-size: 25px;
      justify-content: space-between; 
      min-height: 50px;
      min-width: 50px;
    }
    .btn-Zero {
      background-color: #FFB6C1;
      margin-left: 10px;
      margin-top: 10px;
      font-size: 25px;
      justify-content: space-between; 
      min-height: 50px;
      min-width: 50px;
    }
    .btn-None {
      background-color: grey;
      margin-left: 10px;
      margin-top: 10px;
      font-size: 25px;
      border: black;
      color: white;
      justify-content: space-between; 
      min-height: 50px;
      min-width: 50px;
    }
    .btn-Gen {
      background-color: #79aeed;
      margin-left: 10px;
      margin-top: 10px;
      font-size: 25px;
      color: white;
      border: black;
      justify-content: space-between; 
      min-height: 50px;
      min-width: 50px;
    }
    .btn-outline-secondary{
      margin-left: 10px;
      margin-top: 10px;
      
      min-height: 50px;
      min-width: 50px;
    }
    .a{
      color: #42b5d4;
    }
    .b{
      color: #b879ed;
    }
    .c{
      color: #FFB6C1;
    }
  
    `}
  </style>
      
      <div>
      
      <Dropdown>
        <Dropdown.Toggle variant={transform==''?'None':transform} id="dropdown-basic">
          {transform==''?'None':transform}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item className="a dropdown-item" onClick = {() => adjustTransform('Gate')}>Gate</Dropdown.Item>
          <Dropdown.Item className="b dropdown-item" onClick = {() => adjustTransform('Inv')}>Invert</Dropdown.Item>
          <Dropdown.Item className="c dropdown-item" onClick = {() => adjustTransform('Zero')}>Zero</Dropdown.Item>
          <Dropdown.Item onClick = {() => adjustTransform('')}>None</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      
</div>
    <div>
      {(typeof data.members === 'undefined') ? (
        <p>Loading...</p>
      ) : (
        data.members.map((member, i ) => (

          <Button className="rounded-circle"  variant={member==''?"outline-secondary":member} key={i} onClick={() => editArr(i)}></Button>
   
        ))
      )}
    </div>
    
    <Button onClick={() => generateTransform()} variant={'Gen'}>Generate</Button>
    </div>
  )
}

export default App