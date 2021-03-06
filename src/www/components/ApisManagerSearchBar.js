import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom'
import {Button, Dropdown, ButtonGroup} from 'react-bootstrap'
import SearchInput from './SearchInput'
import checkImage from '../images/check.svg'


const ApisManagerSearchBar = function(props) {
    const [topTagOptions,setTopTagOptions] = useState([])
    useEffect(() => {
        ////console.log(['kust nabager ',props.lookups.listsLookups])
        var topTagOptionss = props.lookups.apiTagsLookups && props.lookups.apiTagsLookups.sort().map(function(listKey,i) {
              return <Dropdown.Item key={i} value={listKey} onClick={function(e) {props.setListFilterValue(listKey)}}  >{listKey}</Dropdown.Item>
        })
        topTagOptionss.unshift(<Dropdown.Item key={'empty_key_value_empty'} value={''} onClick={function(e) {props.setListFilterValue('')}}  >&nbsp;</Dropdown.Item>)
        topTagOptionss.push(<Dropdown.Item key={'Not In A List'} value={'Not In A List'} onClick={function(e) {props.setListFilterValue('Not In A List')}}  ><b>Not Tagged</b></Dropdown.Item>)
        setTopTagOptions(topTagOptionss)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.lookups])
    
    return <div>
            {<span>
                {props.lookups.selectedApiTally > 0 && <Button size="lg"  onClick={function(e) { props.resetSelection(e) }} variant="success"  ><img style={{height:'1em'}} src={checkImage} alt="Deselect" /></Button> }
                {props.lookups.selectedApiTally <= 0 && <Button size="lg" onClick={function(e) { props.selectAll(e) }} variant="secondary"  ><img style={{height:'1em'}} src={checkImage} alt="Select" /></Button> }
                
           </span>}   
            
            {<Dropdown style={{marginLeft:'0.5em'}}  as={ButtonGroup}>
                  <Dropdown.Toggle split   id="dropdown-split-basic" ></Dropdown.Toggle>
                  <Button  >{'Filter by Tag'+(props.listFilterValue ? ' - '+ props.listFilterValue : '')} </Button>
                  <Dropdown.Menu>
                      {topTagOptions} 
                  </Dropdown.Menu>
                </Dropdown>}
              <Button  style={{marginLeft:'1em'}} variant="success" onClick={function(e) {props.createEmptyItem(props.listFilterValue)}} >New Api</Button>
              
              
              {props.fromSkill && <Link to={'/skills/skill/'+props.fromSkill}><Button  style={{marginLeft:'1em', float:'right'}} variant="warning"  >Back to Skill</Button></Link>}
        </div>
}
export default ApisManagerSearchBar
