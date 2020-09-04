/* global window */
import {Link} from 'react-router-dom'
import {Button, ListGroup } from 'react-bootstrap'
import ImportListsDropDown from './ImportListsDropDown'

import React, {Fragment} from 'react';
import FileReaderInput from 'react-file-reader-input';

import TagAllDropDown from './TagAllDropDown'
import IntentAllDropDown from './IntentAllDropDown'
import SkillAllDropDown from './SkillAllDropDown'


import helpSVG from '../images/helpoverview.svg'

function MatchesTallies(props) {
    return <span style={{float:'left', fontWeight:'bold'}} >&nbsp;{props.filteredItems.length}/{props.items.length} matches </span>
}

function HelpMenu(props) {
    return <div>
        <Link style={{marginRight:'1em'}} to="/help" ><Button>Home</Button></Link>
        <Link style={{marginRight:'1em'}} to="/helpimport" ><Button>Import</Button></Link>
        <Link style={{marginRight:'1em'}} to="/helpexport" ><Button>Export</Button></Link>
        <Link style={{marginRight:'1em'}} to="/helpabout" ><Button>About</Button></Link>
    </div>
}

function HelpText(props) { 
    return <div style={{marginLeft:'0.5em'}}>
        <HelpMenu/>
        <h1>NLU tool</h1>
        <img src={helpSVG} style={{width: '80%', height:'15em' }} alt="Help Overview"/>
        <div>This tool is intended to help collect open licensed NLU data. Specifically, it captures sentences with related intent and entity maps.</div>
        <div>Examples can be tagged for organisation and collected into your own skills for export into various NLU training data formats including RASA, JOVO (Alexa, Google), Mycroft and native JSON.</div>
        <hr/>
        <div>This tool is a Progressive Web Application. It works without the Internet. All data is stored locally in your web browser. Source Code at <a target="_new" href="https://github.com/syntithenai/opennludata" >Github</a></div>
        <div>React window is used to allow the tool to work with tens of thousands of example and entity records.</div>
        <div>When the Internet is available, <b>this site uses Google Analytics to measure engagement and improve future versions.</b></div>
       <hr/>
       <p><Link to="/search" ><Button>Search </Button></Link> the community database of NLU example records.</p>
         <p><Link to="/sources" ><Button>Sources</Button></Link> to edit and import skills, pasted text or uploaded files.</p>
        <p><Link to="/examples" ><Button>Organise</Button></Link> your examples using tags and cleanup untagged examples.</p>
        <p><Link to="/skills" ><Button>Skills</Button></Link> to add platform metadata for export in various training formats or publishing to the community database.</p>
        </div>
}

function HelpTextImport(props) { 
    return <div style={{marginLeft:'0.5em'}}>
    <HelpMenu/>
            <h1>Importing Data</h1>
            <div>This tool can import files two types of data, entities and intents.
            <ul>
                <li><h3>Entity Values</h3>
                    
                </li>
                <li><h3>Intent Examples</h3>
                
                </li>
            </ul>
            
            </div>
            <hr/>
        </div>
}

function HelpTextAbout(props) { 
    return <div style={{marginLeft:'0.5em'}}>
    <HelpMenu/>
            <h1>About</h1>
<br/>
            <div><h3>Bugs/Feedback</h3>Please share any feedback on the <a target="_new" href="https://github.com/syntithenai/opennludata/issues" >Github Issues Page</a></div>
            <br/>
             <div>The source code for this tools is available under an MIT Open Source Licence. It is built using create-react-app with localForage for cross platform local persistence.</div>
            <hr/>
            <div>MIT Licenced Open Source Licence  - CopyLeft Steve Ryan (syntithenai@gmail.com)</div>
            
             <div>Icons from  The Noun Project and others.</div>
             <ul>
             <li>Man Singing by Gan Khoon Lay from  <a href='https://thenounproject.com/term/man-singing/642288/' target="_new" >The Noun Project</a></li>
             <li>Head by hunotika from <a href='https://thenounproject.com/term/head/184237/' target="_new" >The Noun Project</a></li>
             </ul>
            <hr/>
        </div>
}

function HelpTextExport(props) { 
    return <div style={{marginLeft:'0.5em'}}>
    <HelpMenu/>
            <h1>Exporting</h1>
            <div>This tool can currently export to a number of formats including
            <ul>
                <li>Native JSON format</li>
                <li>Mycroft intents and entities for Padatious NLU</li>
                <li>RASA training data</li>
                <li>JOVO model files</li>
            </ul>
            </div>

        </div>
}


function NewFileButtons(props) {
    return <span>
        <Link to={props.match.url + '/text'} style={{float:'right'}} ><Button>Paste Text</Button></Link>
        <FileSelector {...props}/>   
    </span>
}


function ListsList(props) {
     const { items} = props  
     if (items) {
       const list = Object.values(items).map(function(item,i) {
            return <ListGroup.Item  key={i}  >
                   <Button style={{float:'right', marginLeft:'0.5em'}} variant="danger" onClick={function(e) {if(window.confirm('Really delete list '+items[i].title)) props.deleteItem(i)}} >Delete</Button>
                   <Link to={props.match.url+"/text/"+item.id} ><Button style={{float:'right',marginLeft:'0.5em'}}  >Edit</Button></Link>
                   <span style={{width:'90%'}}  >{item.title}</span>
               </ListGroup.Item>
        })
        return <ListGroup>{list}</ListGroup>
    } else {
        return null
    }
}

function FileSelector(props) {
    return <form onSubmit={function(e) {e.preventDefault()}} style={{float:'right'}}>
            <FileReaderInput multiple as="binary" id="my-file-input"
                             onChange={props.handleFileSelection}>
              <Button style={{ marginRight:'0.5em'}} >Select files</Button>
            </FileReaderInput>
          </form>
}

function WithSelectedDropDowns(props) {
    return <Fragment>
        <span>With {props.lookups.selectedTally} selected&nbsp;</span>
               
        <SkillAllDropDown skillSetAll={props.skillSetAll} skillAllValue={props.skillAllValue}  setSkillAllValue={props.setSkillAllValue}  lookups={props.lookups} untagAll={props.untagAll} unskillAll={props.unskillAll} />
        <IntentAllDropDown intentAll={props.intentAll} intentAllValue={props.intentAllValue} setIntentAllValue={props.setIntentAllValue}  lookups={props.lookups} untagAll={props.untagAll} unskillAll={props.unskillAll} />
        <TagAllDropDown tagAll={props.tagAll} tagAllValue={props.tagAllValue} setTagAllValue={props.setTagAllValue}  lookups={props.lookups} untagAll={props.untagAll} unskillAll={props.unskillAll} />
    </Fragment>

}

export { MatchesTallies,  HelpTextImport,HelpTextExport,HelpTextAbout,HelpText, NewFileButtons, ListsList, FileSelector, WithSelectedDropDowns}
