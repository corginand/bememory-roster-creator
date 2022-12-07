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
          <div className={"table-column"}>
            <div className={"column-name"}><span>{level}</span></div>
            {currentRosterList[level].map((item, key) => 
                {return (
                  <div className={'table-cell'} key={key}>
                    <div className='line-container'>
                      <div className='line-container-top' />
                      <div className='line-container-bottom' />
                    </div>
                    <div className='image-container'>
                      <img src={item.img} />
                      <div className='close-btn' onClick={() => removeFromList(item.id, level)}>X</div>
                    </div>
                    <div className='line-container'>
                      <div className='line-container-top' />
                      <div className='line-container-bottom' />
                    </div>
                  </div>
                )}
              )}
          </div>)}
      )}
    </div>
    <span>{currentCount} out of 23 slots used</span>
    </>
  )
}
  
export default HomePage