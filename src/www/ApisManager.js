/* global window */
import React, { useEffect, useState} from 'react';
import './App.css';
//import {Link, useParams, useHistory} from 'react-router-dom'
import {Tabs,Tab, Button , Dropdown, ButtonGroup, InputGroup} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { VariableSizeList as List } from 'react-window';
import ListAllDropDown from './components/ListAllDropDown'
import {generateObjectId} from './utils'
import ApisManagerSearchBar from './components/ApisManagerSearchBar'
import ApisManagerRow from './ApisManagerRow'
import useListItemEditor from './useListItemEditor'

var initData = [
   
  ]

initData = initData.map(function(item) {
  return Object.assign(item,{id:generateObjectId()})  
})

//const RenderRow = function(props) {
    //const index = props.index
    //const style = props.style
    //const item = props.data.items[index]
    //return <ApisManagerRow  
         //item={item}  splitNumber={index} style={style}
         //saveItem={props.data.saveItem} deleteItem={props.data.deleteItem} saveNlu={props.data.saveNlu}
         //lookups={props.data.lookups} updateFunctions={props.data.updateFunctions}  lastSelected={props.data.lastSelected} setLastSelected={props.data.setLastSelected} selectBetween={props.data.selectBetween}  />
//}

export default  function ApisManager(props) {
    const {items, listFilterValue, setListFilterValue, loadAll, deleteItem , findKeyBy, searchFilter, setSearchFilter, tagAllValue, setTagAllValue, listRef, tagAll,untagAll, resetSelection, selectAll, saveItemWrap,  filteredItems, deleteAll, createEmptyItem, sort, lastSelected, setLastSelected, selectBetween, fromSkill, fromAction} = useListItemEditor('nlutool','apis','alldata', props.updateFunctions.updateApis, initData, props.updateFunctions.setIsChanged)
    //const [currentList, setCurrentList] = useState('')

    function getItemSize(index) {
        //console.log('action seiz',items,filteredItems)
        var item = items[index]
        var baseSize = 0
        if (window.innerWidth < 430) {
               baseSize =  750
        // medium screen tablet
        } else if (window.innerWidth <= 768) {
               baseSize = 700
        } else {
            baseSize = 705
        }
        var numResponses = item.responses ? item.responses.length : 0
        var numApis = item.apis ? item.apis.length : 0
        var numForms = item.forms ? item.forms.length : 0
        
        //console.log('action seiz',item.apis,item.responses, index, item,baseSize,numResponses)
        return baseSize + numResponses * 90 + numApis * 90 + numForms * 90
    }

  
    const [codeError, setCodeError] = useState(null)
    const [apiFunctions, setApiFunctions] = useState({}) 
    var apiFunctionUpdateTimeout = null
    
    useEffect(() => {
        loadAll()
        props.updateFunctions.updateUtterances()
        props.updateFunctions.updateActions()
        updateApiFunctionsLookups()
    },[]) 
    
    function updateApiFunctionsLookups() {
        setCodeError(null)
        props.updateFunctions.updateApis().then(function(apisCompleteLookups) {
        
        //console.log(['APIBUTTON',button,props.lookups.apisCompleteLookups])
            // instantiate api to discover available functions
            var apiInstance = null
            var newApiFunctions = apiFunctions
            //console.log(['CALLAPI LOOKUP',apisCompleteLookups,window])
            apisCompleteLookups.map(function(apiComplete) {
              //if (apiComplete.value === button.text) {
                try {
                    apiInstance = new Function('intent','history','slots','config','utils','window','slot','response','api','reset','restart','back','listen','nolisten','form',apiComplete && apiComplete.synonym && apiComplete.synonym.trim ? apiComplete.synonym.trim() : '')
                    if (typeof apiInstance === 'function') {
                        //apiFunctions = apiInstance([],{},{}) 
                        newApiFunctions[apiComplete.value] = Object.keys(apiInstance({},[],{},{},{}, window,{},{},{},function(){},function(){},function(){},function(){},function(){},function(){}) )
                    }
                } catch (e) {
                    console.log(e)
                    setCodeError(e.toString())
                
                }

              //}  
            } )
            //console.log(['CALLAPI LOOKUP DONE',newApiFunctions])
            setApiFunctions(newApiFunctions)
        })
    }
    
    // update picklists to trigger syntax check on 1s delay
    useEffect(() => {
        if (apiFunctionUpdateTimeout) clearTimeout(apiFunctionUpdateTimeout) 
        apiFunctionUpdateTimeout = setTimeout(function() {
            //console.log('update api')
            updateApiFunctionsLookups()
        },1000)
        
    },[items]) 
    
   
    function renderEditor(props) {
            if (filteredItems && filteredItems.length > 0) {
            
                return <div>
                    <span style={{float:'left', fontWeight:'bold'}} >&nbsp;{filteredItems.length} matches </span>
                     
                     {props.lookups.selectedApiTally > 0 && <span style={{float:'right'}}> 
                        <span>With {props.lookups.selectedApiTally} selected&nbsp;</span>
                        <Dropdown  as={ButtonGroup}>
                              <Dropdown.Toggle split  size="sm"  id="dropdown-split-basic" ></Dropdown.Toggle>
                              <Button   size="sm" >{'Set Tag'} </Button>
                              <Dropdown.Menu>
                               <form  style={{display:'inline'}} onSubmit={function(e) {e.preventDefault() ; tagAll(e.target.value)}} >
                                    <InputGroup>
                                      <input type="text" className="form-control" onChange={function(e) {setTagAllValue(e.target.value)}}
                                    value={tagAllValue} />
                                    <Button variant="success" onClick={function(e) {tagAll(tagAllValue)}} >Add</Button>
                                    </InputGroup>
                                    
                                  </form>
                                  {props.lookups.apiTagsLookups && props.lookups.apiTagsLookups.sort().map(function(skillKey,i) {
                                  return <Dropdown.Item key={i} value={skillKey}  >
                                    <Button variant="success" onClick={function(e) {setTagAllValue(skillKey); tagAll(skillKey)}} >Add to {skillKey}</Button>
                                    <Button variant="danger" onClick={function(e) { untagAll(skillKey)}} style={{marginLeft: '0.5em'}}>Remove</Button></Dropdown.Item>
                                })}
                              </Dropdown.Menu>
                          </Dropdown>
                        <Button style={{marginLeft:'1em'}} onClick={deleteAll} variant="danger"  >Delete Selected</Button> 
                    </span>} 
                    
                    <div style={{clear:'both'}}>
                        <Tabs  defaultActiveKey="0" id="apistabs">
                            {Array.isArray(filteredItems) && filteredItems.map(function(item,key) {
                                return <Tab key={key} eventKey={key} title={item.value}>
                                <ApisManagerRow  
                                 item={item}  splitNumber={key} style={{}}
                                 saveItem={saveItemWrap} deleteItem={deleteItem}  apiFunctions={apiFunctions} codeError={codeError}
                                 lookups={props.lookups} updateFunctions={props.updateFunctions}  lastSelected={lastSelected} setLastSelected={setLastSelected} selectBetween={selectBetween}  />
                                 
                                </Tab>
                            })}
                        </Tabs>
            
                    </div>
               </div>

            }
              
    }
    
  
    return <div>
        
                   
        {<ApisManagerSearchBar {...props} fromSkill={fromSkill} searchFilter={searchFilter} setSearchFilter={setSearchFilter} listFilterValue={listFilterValue} setListFilterValue={setListFilterValue} resetSelection={resetSelection} selectAll={selectAll} createEmptyItem={createEmptyItem} sort={sort} />}
         
         
         {renderEditor(props)}
    </div>
            
}
   //<div style={{clear:'both'}}>
                            //<List
                                //key="list"
                                //ref={listRef}
                                //itemData={{items: filteredItems, saveItem: saveItemWrap, deleteItem, findKeyBy, lookups: props.lookups, lastSelected, setLastSelected, selectBetween, updateFunctions: props.updateFunctions}}
                                //itemKey={index => index}  
                                //className="List"
                                //height={700}
                                //itemCount={filteredItems.length}
                                //itemSize={getItemSize}
                                //width={'100%'}
                              //>{RenderRow}
                            //</List>
                        //</div>    

 //{JSON.stringify(items)}
    //<hr/>
    
    
    //<hr/>
    //{JSON.stringify(filteredItems)}


