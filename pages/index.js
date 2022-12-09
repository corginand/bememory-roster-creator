import { Fragment, useEffect, useState } from 'react';
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
      //
      digimonData.results.forEach((element, index) => {
        digimonData.results[index].id = index + 1
      });
      //
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

    levelTypes.forEach((data, index) => {
      if(index < 5){
        if(currentRosterList[data].length == 0 || currentRosterList[levelTypes[index+1]].length == 0){
          newLineData.push({['--display' + index] : 'none', ['--value' + index] : 0})
        } else {
          minValue = Math.min(currentRosterList[data].length, currentRosterList[levelTypes[index+1]].length)
          newLineData.push({['--display' + index] : 'block', ['--value' + index] : (minValue*60 + 23)+'px'})
        }
      }
    })

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

  const removeFromList = (name, level) => {
    let index = 0
    let currentValues = {...currentRosterList}

    {currentValues[level].map((item, key) => 
      {
        if(item.name == name){
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
              <div className={"column-name column-name-" + level.toLowerCase().replace(' ','_')}><span>{level}</span></div>
              {currentRosterList[level].map((item, key) => 
                  {return (
                    <div className={'table-cell'} key={key+'-b'}>
                      {levelKey != 0 && (
                      <div style={lineData[levelKey-1]} className={'line-container line-container-' + (levelKey - 1)}>
                        <div className='line-container-top' />
                        <div className='line-container-bottom' />
                      </div>)}
                      <div className='image-container'>
                        <img src={item.img} />
                        <div className='close-btn' onClick={() => removeFromList(item.name, level)}>X</div>
                      </div>
                      <div style={lineData[levelKey]} className={'line-container line-container-' + levelKey}>
                        <div className='line-container-top' />
                        <div className='line-container-bottom' />
                      </div>
                    </div>
                  )}
                )}
            </div>
            {levelKey != 5 && (<div style={lineData[levelKey]} className={"line-table-column line-table-column-" + levelKey} />)}
          </Fragment>
        )}
      )}
    </div>
    <span>{currentCount} out of 23 slots used</span>
    </>
  )
}
  
export default HomePage