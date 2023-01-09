import { Fragment, useEffect, useState } from 'react';
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Accordion } from 'react-bootstrap';

function HomePage() {
  let [autocompleteData, setAutocompleteData] = useState([])
  const [formDisabled, setFormDisabled] = useState(true);
  const [currentDigimon, setCurrentDigimon] = useState({name: ''});
  let [mainRosterList, setMainRosterList] = useState({
    'main': {
      'In-Training I': [],
      'In-Training II': [],
      'Rookie': [],
      'Champion': [],
      'Ultimate': [],
      'Mega': []
    },
    'adventure': {
      'In-Training I': [],
      'In-Training II': [],
      'Rookie': [],
      'Champion': [],
      'Ultimate': [],
      'Mega': [],
    }
  })

  let [lineData, setLineData] = useState({
    main: {
    'value0': 0,
    'value1': 0,
    'value2': 0,
    'value3': 0,
    'value4': 0
    },
    adventure: {
      'value0': 0,
      'value1': 0,
      'value2': 0,
      'value3': 0,
      'value4': 0
    },
  })
  const levelTypes = Object.keys(mainRosterList['main']);
  const [currentCount, setCurrentCount] = useState(0);

  async function getDigimonData() {
    try {
      const res = await fetch('/api/digimon');
      const digimonData = await res.json();

      digimonData.results.forEach((element, index) => {
        digimonData.results[index].id = index + 1
      });

      setAutocompleteData(digimonData.results)
    } catch (err) {
      console.log(err);
    }
  }

  const handleOnSelect = (item) => {
    if(currentCount < 23) {
      setCurrentDigimon(item)
      switch(item.level){
        case 'In-Training I':
          document.getElementById("inline-radio-0").checked = true;
          break;
        case 'In-Training II':
          document.getElementById("inline-radio-1").checked = true;
          break;
        case 'Rookie':
          document.getElementById("inline-radio-2").checked = true;
          break;
        case 'Champion':
        case 'Armor':
          document.getElementById("inline-radio-3").checked = true;
          break;
        case 'Ultimate':
          document.getElementById("inline-radio-4").checked = true;
          break;
        case 'Mega':
          document.getElementById("inline-radio-5").checked = true;
          break;
      }
      setFormDisabled(false)
    }
  }

  const handleLines = () => {
    let newLineData = {main:[], adventure:[]}
    let minValue = 0

    levelTypes.forEach((data, index) => {
      if(index < 5) {
        if(mainRosterList['main'][data].length == 0 || mainRosterList['main'][levelTypes[index+1]].length == 0){
          newLineData['main'].push({['--display' + index] : 0, ['--value' + index] : 0})
        } else {
          minValue = Math.min(mainRosterList['main'][data].length, mainRosterList['main'][levelTypes[index+1]].length)
          newLineData['main'].push({['--display' + index] : 1, ['--value' + index] : (minValue*60 + 23)+'px'})
        }

        if(mainRosterList['adventure'][data].length == 0 || mainRosterList['adventure'][levelTypes[index+1]].length == 0){
          newLineData['adventure'].push({['--display' + index] : 0, ['--value' + index] : 0})
        } else {
          minValue = Math.min(mainRosterList['adventure'][data].length, mainRosterList['adventure'][levelTypes[index+1]].length)
          newLineData['adventure'].push({['--display' + index] : 1, ['--value' + index] : (minValue*60 + 23)+'px'})
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
    let currentValues = {...mainRosterList}
    const level = event.target.group1.value

    if(event.target.adventure.checked){
      currentValues['adventure'][level].push(currentDigimon)
    } else {
      currentValues['main'][level].push(currentDigimon)
    }

    setMainRosterList(currentValues)
    setFormDisabled(true)
  }

  const formatResult = (item) => {
    return (
      <>
        {item.name} <span style={{ fontSize: '12px', color: '#888', zIndex: 99 }}> {item.level}</span>
      </>
    )
  }

  const removeFromList = (name, level, section = 'main') => {
    let index = 0
    let currentValues = {...mainRosterList}

    {currentValues[section][level].map((item, key) => 
      {
        if(item.name == name){
        index = key
        currentValues[section][level].splice(index,1)
      }}
    )}
    setMainRosterList(currentValues)
  }

  const removeFromListOld = (id, level, section = 'main') => {
    let index = 0
    let currentValues = {...mainRosterList}

    {currentValues[section][level].map((item, key) => 
      {if(item.id == id){
        index = key
        currentValues[section][level].splice(index,1)
      }}
    )}
    setMainRosterList(currentValues)
  }

  const moveListElement = (index, level, direction, section = 'main') => {
    let currentValues = {...mainRosterList}
    const movingElement = currentValues[section][level][index]

    if (direction == 'up' && index > 0) {
      currentValues[section][level][index] = mainRosterList[section][level][index-1]
      currentValues[section][level][index-1] = movingElement
    } else if(direction == 'down' && index < mainRosterList[section][level].length - 1) {
      currentValues[section][level][index] = mainRosterList[section][level][index+1]
      currentValues[section][level][index+1] = movingElement
    }
    setMainRosterList(currentValues)
  }

  useEffect(() => {
    const totalValue = 
    mainRosterList['main']['In-Training I'].length + mainRosterList['adventure']['In-Training I'].length
    + mainRosterList['main']['In-Training II'].length + mainRosterList['adventure']['In-Training II'].length
    + mainRosterList['main']['Rookie'].length + mainRosterList['adventure']['Rookie'].length
    + mainRosterList['main']['Champion'].length + mainRosterList['adventure']['Champion'].length
    + mainRosterList['main']['Ultimate'].length + mainRosterList['adventure']['Ultimate'].length
    + mainRosterList['main']['Mega'].length + mainRosterList['adventure']['Mega'].length
    setCurrentCount(totalValue)
    handleLines()
  }, [mainRosterList]);

  return ( 
    <>
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
                <div key={`inline-checkbox`} className="mb-3">
                  <Form.Check
                    inline
                      label={'Locked to Adventure'}
                      value={true}
                      name="adventure"
                      type={'checkbox'}
                      id={'inline-check-adv'} />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" type="submit" disabled={formDisabled}>
                  Save
                </Button>
              </Modal.Footer>
            </Form>
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
              {mainRosterList['main'][level].map((item, key) => 
                  {return (
                    <div className={'table-cell'} key={key+'-b'}>
                      {levelKey != 0 && (
                      <div style={lineData['main'][levelKey-1]} className={'line-container line-container-' + (levelKey - 1)}>
                        <div className='line-container-top' />
                        <div className='line-container-bottom' />
                      </div>)}
                      <div className='image-container'>
                        <img src={item.img} />
                        <div className='close-btn' onClick={() => removeFromList(item.name, level, 'main')}>X</div>
                        {key > 0 && <div className='top-arrow-btn' onClick={() => moveListElement(key, level, 'up', 'main')}>{'<'}</div>}
                        {key < mainRosterList['main'][level].length - 1 && <div className='bottom-arrow-btn' onClick={() => moveListElement(key, level, 'down', 'main')}>{'>'}</div>}
                      </div>
                      <div style={lineData['main'][levelKey]} className={'line-container line-container-' + levelKey}>
                        <div className='line-container-top' />
                        <div className='line-container-bottom' />
                      </div>
                    </div>
                  )}
                )}
            </div>
            {levelKey != 5 && (<div style={lineData.main[levelKey]} className={"line-table-column line-table-column-" + levelKey} />)}
          </Fragment>
        )}
      )}
    </div>

    <div className={'adventure-table'}>
      {levelTypes.map((level, levelKey) =>
        {return (
          <Fragment key={levelKey + '-c'}>
            <div className={"table-column"}>
              <div className={"column-name column-name-" + level.toLowerCase().replace(' ','_')}><span>{level}</span></div>
              {mainRosterList['adventure'][level].map((item, key) => 
                  {return (
                    <div className={'table-cell'} key={key + '-d'}>
                      {levelKey != 0 && (
                      <div style={lineData['adventure'][levelKey-1]} className={'line-container line-container-' + (levelKey - 1)}>
                        <div className='line-container-top' />
                        <div className='line-container-bottom' />
                      </div>)}
                      <div className='image-container'>
                        <img src={item.img} />
                        <div className='close-btn' onClick={() => removeFromList(item.name, level, 'adventure')}>X</div>
                        {key > 0 && <div className='top-arrow-btn' onClick={() => moveListElement(key, level, 'up', 'adventure')}>{'<'}</div>}
                        {key < mainRosterList['adventure'][level].length - 1 && <div className='bottom-arrow-btn' onClick={() => moveListElement(key, level, 'down', 'adventure')}>{'>'}</div>}
                      </div>
                      <div style={lineData['adventure'][levelKey]} className={'line-container line-container-' + levelKey}>
                        <div className='line-container-top' />
                        <div className='line-container-bottom' />
                      </div>
                    </div>
                  )}
                )}
            </div>
            {levelKey != 5 && (<div style={lineData.adventure[levelKey]} className={"line-table-column line-table-column-" + levelKey} />)}
          </Fragment>
        )}
      )}
    </div>
    <span>{currentCount} out of 23 slots used</span>
    </>
  )
}
  
export default HomePage