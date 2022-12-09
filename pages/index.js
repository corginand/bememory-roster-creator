import { Fragment, useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Accordion } from 'react-bootstrap';

function HomePage() {
  let [autocompleteData, setAutocompleteData] = useState([])
  const [show, setShow] = useState(false);
  const [currentDigimon, setCurrentDigimon] = useState({name: ''});
  let [currentRosterList, setCurrentRosterList] = useState({
    'In-Training I': [],
    'In-Training II': [],
    'Rookie': [],
    'Champion': [],
    'Ultimate': [],
    'Mega': [],
  })
  let [lineData, setLineData] = useState({
    'value0': 0,
    'value1': 0,
    'value2': 0,
    'value3': 0,
    'value4': 0
  })
  const levelTypes = Object.keys(currentRosterList);
  const [currentCount, setCurrentCount] = useState(0);

  const handleClose = () => setShow(false);

  async function getDigimonData() {
    try {
      const res = await fetch('/api/digimon');
      const digimonData = await res.json();
      setAutocompleteData(digimonData.results)
    } catch (err) {
      console.log(err);
    }
  }

  const handleOnSelect = (item) => {
    if(currentCount < 23) {
      setCurrentDigimon(item)
      setShow(true)
    }
  }

  const handleLines = () => {
    let newLineData = []
    let minValue = 0
    if(currentRosterList['In-Training I'].length == 0 || currentRosterList['In-Training II'].length == 0){
      newLineData.push({'--display0': 'none', '--value0': 0})
    } else {
      minValue = Math.min(currentRosterList['In-Training I'].length, currentRosterList['In-Training II'].length)
      newLineData.push({'--display0': 'block', '--value0': (minValue*60 + 23)+'px' })
    }

    if(currentRosterList['In-Training II'].length == 0 || currentRosterList['Rookie'].length == 0){
      newLineData.push({'--display1': 'none', '--value1': 0})
    } else {
      minValue = Math.min(currentRosterList['In-Training II'].length, currentRosterList['Rookie'].length)
      newLineData.push({'--display1': 'block', '--value1': (minValue*60 + 23)+'px' })
    }

    if(currentRosterList['Rookie'].length == 0 || currentRosterList['Champion'].length == 0){
      newLineData.push({'--display2': 'none', '--value2': 0})
    } else {
      minValue = Math.min(currentRosterList['Rookie'].length, currentRosterList['Champion'].length)
      newLineData.push({'--display2': 'block', '--value2': (minValue*60 + 23)+'px' })
    }

    if(currentRosterList['Champion'].length == 0 || currentRosterList['Ultimate'].length == 0){
      newLineData.push({'--display3': 'none', '--value3': 0})
    } else {
      minValue = Math.min(currentRosterList['Champion'].length, currentRosterList['Ultimate'].length)
      newLineData.push({'--display3': 'block', '--value3': (minValue*60 + 23)+'px' })
    }

    if(currentRosterList['Ultimate'].length == 0 || currentRosterList['Mega'].length == 0){
      newLineData.push({'--display4': 'none', '--value4': 0})
    } else {
      minValue = Math.min(currentRosterList['Ultimate'].length, currentRosterList['Mega'].length)
      newLineData.push({'--display4': 'block', '--value4': (minValue*60 + 23)+'px' })
    }


    setLineData(newLineData)
  }

  useEffect(() => {
    getDigimonData()
  }, []);

  const addToColumn = (event) => {
    event.preventDefault()
    let currentValues = {...currentRosterList}
    const level = event.target.group1.value
    currentValues[level].push(currentDigimon)

    setCurrentRosterList(currentValues)

    handleClose()
  }

  const formatResult = (item) => {
    return (
      <>
        {item.name} <span style={{ fontSize: '12px', color: '#888', zIndex: 99 }}> {item.level}</span>
      </>
    )
  }

  const removeFromList = (id, level) => {
    let index = 0
    let currentValues = {...currentRosterList}
    let compositeId = id + level

    {currentValues[level].map((item, key) => 
      {const newId = item.id + item.level
        if(newId == compositeId){
        index = key
        currentValues[level].splice(index,1)
      }}
    )}
    setCurrentRosterList(currentValues)
  }

  const removeFromListOld = (id, level) => {
    let index = 0
    let currentValues = {...currentRosterList}

    {currentValues[level].map((item, key) => 
      {if(item.id == id){
        index = key
        currentValues[level].splice(index,1)
      }}
    )}
    setCurrentRosterList(currentValues)
  }

  useEffect(() => {
    const totalValue = currentRosterList['In-Training I'].length + currentRosterList['In-Training II'].length + currentRosterList['Rookie'].length + currentRosterList['Champion'].length + currentRosterList['Ultimate'].length + currentRosterList['Mega'].length
    setCurrentCount(totalValue)
    handleLines()
  }, [currentRosterList]);

  return ( 
    <>
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title> Pick a column for <b>{currentDigimon.name}</b></Modal.Title>
      </Modal.Header>
      <Form noValidate onSubmit={addToColumn}>
        <Modal.Body>
          <div key={`inline-radio`} className="mb-3">
            {levelTypes.map((level, levelKey) =>
              {return (
                <Form.Check
                  inline
                  label={level}
                  value={level}
                  name="group1"
                  type={'radio'}
                  id={'inline-radio-'+ levelKey}
                  key={levelKey}/>
              )}
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" type="submit">
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>

    <div className={'autocomplete-container'}>
      <Accordion>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Add a Digimon</Accordion.Header>
          <Accordion.Body>
            <ReactSearchAutocomplete
              items={autocompleteData}
              onSelect={handleOnSelect}
              maxResults={7}
              formatResult={formatResult}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>

    <div className={'main-table'}>
      {levelTypes.map((level, levelKey) =>
        {return (
          <Fragment key={levelKey+'-a'}>
            <div className={"table-column"}>
              <div className={"column-name"}><span>{level}</span></div>
              {currentRosterList[level].map((item, key) => 
                  {return (
                    <div className={'table-cell'} key={key+'-b'}>
                      <div className='line-container'>
                        <div className='line-container-top' />
                        <div className='line-container-bottom' />
                      </div>
                      <div className='image-container'>
                        <img src={item.img} />
                        <div className='close-btn' onClick={() => removeFromList(item.name, level)}>X</div>
                      </div>
                      <div className='line-container'>
                        <div className='line-container-top' />
                        <div className='line-container-bottom' />
                      </div>
                    </div>
                  )}
                )}
            </div>
            {level != 'Mega' && (<div style={lineData[levelKey]} className={"line-table-column line-table-column-" + levelKey} />)}
          </Fragment>
        )}
      )}
    </div>
    <span>{currentCount} out of 23 slots used</span>
    </>
  )
}
  
export default HomePage