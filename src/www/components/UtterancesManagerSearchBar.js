import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom'
import {Button, Dropdown, ButtonGroup} from 'react-bootstrap'
import SearchInput from './SearchInput'
import checkImage from '../images/check.svg'


const UtterancesManagerSearchBar = function(props) {
    const [topTagOptions,setTopTagOptions] = useState([])
    useEffect(() => {
        ////console.log(['kust nabager ',props.lookups.listsLookups])
        var topTagOptionss = props.lookups.utteranceTagsLookups && props.lookups.utteranceTagsLookups.sort().map(function(listKey,i) {
              return <Dropdown.Item key={i} value={listKey} onClick={function(e) {props.setListFilterValue(listKey)}}  >{listKey}</Dropdown.Item>
        })
        topTagOptionss.unshift(<Dropdown.Item key={'empty_key_value_empty'} value={''} onClick={function(e) {props.setListFilterValue('')}}  >&nbsp;</Dropdown.Item>)
        topTagOptionss.push(<Dropdown.Item key={'Not In A List'} value={'Not In A List'} onClick={function(e) {props.setListFilterValue('Not In A List')}}  ><b>Not In A List</b></Dropdown.Item>)
        setTopTagOptions(topTagOptionss)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.lookups])
    
    return <div>
            {<span>
            
                {props.lookups.selectedUtteranceTally > 0 && <Button size="lg"  onClick={function(e) {props.resetSelection(e) }} variant="success"  ><img style={{height:'1em'}} src={checkImage} alt="Deselect" /></Button> }
                {props.lookups.selectedUtteranceTally <= 0 && <Button size="lg" onClick={function(e) {props.selectAll(e) }} variant="secondary"  ><img style={{height:'1em'}} src={checkImage} alt="Select" /></Button> }
                
                
           </span>}  
            <span style={{marginLeft:'0.4em'}}><SearchInput searchFilter={props.searchFilter} setSearchFilter={props.setSearchFilter} /></span>
            {<Dropdown style={{marginLeft:'0.5em'}}  as={ButtonGroup}>
                  <Dropdown.Toggle split   id="dropdown-split-basic" ></Dropdown.Toggle>
                  <Button  >{'List'+(props.listFilterValue ? ' - '+ props.listFilterValue : '')} </Button>
                  <Dropdown.Menu>
                      {topTagOptions}
                  </Dropdown.Menu>
                </Dropdown>}
              <Button  style={{marginLeft:'1em'}} variant="success" onClick={function(e) {props.createEmptyItem(props.listFilterValue)}} >New Response</Button>
              <Button  style={{marginLeft:'1em'}} variant="primary" onClick={function(e) {props.sort(function(a,b) { if (a.value < b.value) return -1; else return 1;})}} >Sort</Button>
              
              {(props.fromSkill && !props.fromAction && !props.fromForm) && <Link to={'/skills/skill/'+props.fromSkill}><Button  style={{marginLeft:'1em', float:'right'}} variant="warning"  >Back to Skill</Button></Link>}
              
              {(props.fromAction) && <Link to={'/actions/filter/'+props.fromAction+((props.fromSkill && props.fromSkill.trim()) ? '/fromskill/' + props.fromSkill : '')}><Button  style={{marginLeft:'1em', float:'right'}} variant="warning"  >Back to Action</Button></Link>}
              
              {(props.fromForm) && <Link to={'/forms/filter/'+props.fromForm+((props.fromSkill && props.fromSkill.trim()) ? '/fromskill/' + props.fromSkill : '')}><Button  style={{marginLeft:'1em', float:'right'}} variant="warning"  >Back to Form</Button></Link>}
              
              
        </div>
}
export default UtterancesManagerSearchBar
