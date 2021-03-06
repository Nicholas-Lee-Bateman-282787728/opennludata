/* global window */
import {Button,   Dropdown, ButtonGroup } from 'react-bootstrap'
import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactTags from 'react-tag-autocomplete'
import useNluRow from './useNluRow'
import SuggestionComponent from './components/SuggestionComponent'
import checkImage from './images/check.svg'
import thumbdownImage from './images/thumb-down.svg'
import thumbupImage from './images/thumb-up.svg'


export default function NluImportRow(props) {
     const  {item, splitNumber , style} = props;
       const {    
            intentTitle, setIntentTitle, selectionState, setSelectionState, newEntity, setNewEntity, tags, skills, reactTags, reactSkills, 
            onTagDelete, onTagAddition, onSkillDelete,onSkillAddition,  updateExampleContent, entityClicked, entityTypeChanged, intentChanged, entityDelete, selectItem,  deselectItem
        } = useNluRow(props.item, props.saveItem, props.splitNumber, props.style, props.setPageMessage)
                
       var intentOptions = props.lookups.intentLookups && props.lookups.intentLookups.sort().map(function(intentKey,i) {
          return <Dropdown.Item key={i} value={intentKey} onClick={function(e) {intentChanged(intentKey)}}  >{intentKey}</Dropdown.Item>
       })
       // ONE PER ENTITY FOR THIS EXAMPLE
       var entitiesDropdowns = item && item.entities ? item.entities.map(function(entity,i) {
           var entityOptions = props.lookups.entityLookups.sort().map(function(entityKey,j) {
              return <Dropdown.Item  key={j} value={entityKey} onClick={function(e) {entityTypeChanged(i,entityKey)}}  >{entityKey}</Dropdown.Item>
           }) 
           return<Dropdown style={{marginLeft:'0.2em'}} variant='info'  key={i}  as={ButtonGroup}>
              <Dropdown.Toggle variant='info'  split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
              <Button variant='info'   size="sm"  onClick={function(e) {entityClicked(i,entity.type)}} >
              <b>{entity.type}</b> 
                -
              {entity.value ? entity.value : 'Select Entity Type'}
              </Button>
              <Button variant="info" size="sm" onClick={function(e) {entityDelete(i,'')}} >X</Button>
              <Dropdown.Menu>
                  <form  style={{display:'inline'}}>
                    <div className="form-group">
                      <input type="text" className="form-control" onChange={function(e) {entityTypeChanged(i,e.target.value)}}
                    value={entity.type} />
                    </div>
                  </form>
                  {entityOptions}
              </Dropdown.Menu>
            </Dropdown>
       }): [] ;
        //PLUS CREATE NEW WHEN TEXT IS SELECTED
       if (selectionState  && selectionState.textSelection && selectionState.textSelection.length > 0 &&  selectionState.textSelectionFrom === splitNumber) {
           var entityOptions =  props.lookups.entityLookups && props.lookups.entityLookups.sort().map(function(entityKey,j) {
              return <Dropdown.Item key={j} value={entityKey} onClick={function(e) {entityTypeChanged(-1,entityKey)}}  >{entityKey}</Dropdown.Item>
           })
           entitiesDropdowns.push(<Dropdown key="new" variant='success'  as={ButtonGroup}>

          <Dropdown.Toggle variant='success'  split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
          <Button  variant='success' size="sm" >New Entity</Button>

          <Dropdown.Menu>
           <form style={{display:'inline'}} onSubmit={function(e) {e.preventDefault(); entityTypeChanged(-1,newEntity)}}>
                <div className="form-group">
                  <input type="text" className="form-control" onChange={function(e) {setNewEntity(e.target.value)}}
                value={newEntity} />
                </div>
              </form>
              {entityOptions}
          </Dropdown.Menu>
        </Dropdown>)
       }
       //var buttonImageStyle={color:'white', height:'2em'}
       return item && <div style={style} className={splitNumber % 2 ? 'ListItemOdd' : 'ListItemEven'}>
               <div style={{position:'relative', width: '100%', textAlign:'left',  borderTop: '2px solid black'}}>
                  
                   {!item.isSelected && <Button style={{float: 'left'}} size="lg" variant="secondary" onClick={function() {selectItem(splitNumber)}} ><img style={{height:'1em'}} src={checkImage} alt="Select" /></Button>}
                  {item.isSelected && <Button style={{float: 'left'}} size="lg" variant="success" onClick={function() {deselectItem(splitNumber)}} ><img style={{height:'1em'}} src={checkImage} alt="Deselect" /></Button>}
                  
                  {item.intent && <Button  style={{float:'right', marginLeft:'0.2em'}}  variant="success"  onClick={function() {props.saveNlu(splitNumber)}} ><img src={thumbupImage} alt="Save" /> Save</Button>}
                  {!item && <Button   style={{float:'right', marginLeft:'0.2em'}} variant="secondary" ><img src={thumbupImage} alt="Save" /> Import</Button>} 
                  <Button  variant="danger" style={{float:'right'}} onClick={function(e) {props.deleteItem(splitNumber,(item.id ? item.id : ''))}} ><img src={thumbdownImage} alt="Delete" /> Delete</Button>
                  
                 
                  <Dropdown  style={{float:'left'}} as={ButtonGroup}>
                  <Dropdown.Toggle split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
                  <Button   size="sm" >{item.intent ? item.intent.toString() : 'Select Intent'} </Button>
                  <Dropdown.Menu>
                   <form  style={{display:'inline'}} onSubmit={function(e) {e.preventDefault(); intentChanged(intentTitle)}}>
                        <div className="form-group">
                          <input type="text" className="form-control" value={intentTitle} onChange={function(e) {setIntentTitle(e.target.value)}}
                         />
                        </div>
                      </form>
                      {intentOptions}
                  </Dropdown.Menu>
                  </Dropdown>
                  <span style={{float:'left'}}>{entitiesDropdowns}</span>
                 
                  
                  <div style={{float:'left'}}>
                   <ReactTags
                    placeholderText="Add to skill"
                    minQueryLength={0}
                    maxSuggestionsLength={50}
                    autoresize={false}
                    allowNew={true}
                    ref={reactSkills}
                    tags={skills}
                    suggestionComponent={SuggestionComponent}
                    suggestions={props.lookups.skillLookups.map(function(tag,i) {return {id: i, name: tag}})}
                    onDelete={onSkillDelete}
                    onAddition={onSkillAddition} /> 
                    </div>
                    
                  <div style={{float:'left'}}>
                   <ReactTags
                    placeholderText="Add new tag"
                    minQueryLength={0}
                    maxSuggestionsLength={50}
                    autoresize={false}
                    allowNew={true}
                    ref={reactTags}
                    tags={tags}
                    suggestionComponent={SuggestionComponent}
                    suggestions={props.lookups.tagLookups.map(function(tag,i) {return {id: i, name: tag}})}
                    onDelete={onTagDelete}
                    onAddition={onTagAddition} /> 
                    </div>
                  
                  <input  
                 
                   onFocus={ function(e) {
                       setSelectionState(null)
                    }}
                   onSelect={ function(e) {
                     var textSelection = window.getSelection().toString(); 
                     setSelectionState({textSelection:textSelection, textSelectionFrom: splitNumber, startTextSelection: e.target.selectionStart, endTextSelection: e.target.selectionEnd})
                  }}  
                   type='text'   style={{clear:'both', width:'80%'}}  value={item.example} id={"example_input_"+splitNumber} 
                   onChange={function(e) { updateExampleContent(e.target.value)}} />
                  
                  
                
                
            </div>
      </div>
}
