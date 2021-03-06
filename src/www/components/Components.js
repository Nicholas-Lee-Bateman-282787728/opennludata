/* global window */
import {Link} from 'react-router-dom'
import {Button, ListGroup } from 'react-bootstrap'
import ImportListsDropDown from './ImportListsDropDown'

import React, {Fragment} from 'react';
import FileReaderInput from 'react-file-reader-input';

import TagAllDropDown from './TagAllDropDown'
import IntentAllDropDown from './IntentAllDropDown'
import SkillAllDropDown from './SkillAllDropDown'
import RemixEntitiesModal from './RemixEntitiesModal'

import helpSVG from '../images/helpoverview.svg'

function MatchesTallies(props) {
    return <span style={{float:'left', fontWeight:'bold'}} >&nbsp;{props.filteredItems.length}/{props.items.length} matches </span>
}

function HelpMenu(props) {
    return <div>
        <Link style={{marginRight:'1em'}} to="/help" ><Button>Home</Button></Link>
        <Link style={{marginRight:'1em'}} to="/helpimport" ><Button>Import</Button></Link>
        <Link style={{marginRight:'1em'}} to="/helpexport" ><Button>Export</Button></Link>
        <Link style={{marginRight:'1em'}} to="/helptips" ><Button>Tips</Button></Link>
        <Link style={{marginRight:'1em'}} to="/helpabout" ><Button>About</Button></Link>
    </div>
}

function HelpText(props) { 
    return <div style={{marginLeft:'0.5em'}}>
        <HelpMenu/>
        <h1>NLU tool</h1>
        <img src={helpSVG} style={{width: '80%', height:'15em' }} alt="Help Overview"/>
<br/><br/>        
        <div>This tool helps voice developers build vocabularies for their applications by providing <b>import and export of various NLU training data formats</b>, and a <b>searchable database of community submitted, open licensed skills.</b>
        </div>
        

       <hr/>
       <p><Link to="/search" ><Button>Search </Button></Link> the community database of NLU example records.</p>
         <p><Link to="/sources" ><Button>Sources</Button></Link> to edit and import skills, pasted text or uploaded files.</p>
        <p><Link to="/examples" ><Button>Organise</Button></Link> your examples using tags and markup the entities in your intent examples.</p>
        <p><Link to="/skills" ><Button>Skills</Button></Link> to add platform metadata for export in various training formats or publishing to the community database.</p>
        
        <hr/>
        <h3>Features</h3>
        <ul>
            <li>Search for open licenced training data submitted by the community</li>
            <li>Import training data from text files, RASA , JOVO (Alexa, Google), Mycroft and native JSON.</li>
            <li>Edit training data and tag entities in intent examples</li>
            <li>Filtering, tagging, multiple selection and bulk operations to quickly collect training data into an exportable skill</li>
            <li>Virtual rendering with react-window is used to allow fast rendering of lists of intents and entities with many thousands of values</li>
            <li>Export training data suitable for RASA, JOVO and Mycroft</li>
            <li>Publish your skill to the community repository under an open source license</li>
            
        </ul>
        <ul>
            <li>This tool is a Progressive Web Application. Most features work without the Internet.</li>
            <li>MIT Open Source licensed code at <a target="_new" href="https://github.com/syntithenai/opennludata" >Github</a></li>
            <li>Cross platform nodejs server</li>
            <li>Published skills are committed to Github to ensure long term availability of collected data.</li>
            <li>To ensure ongoing availability, the web pages are hosted with github pages and the search interface relies on static data generated during publishing so a database/backend server is only required when publishing)</li>
             <li>When the Internet is available, <b>this site uses Google Analytics to measure engagement and improve future versions.</b> </li>
        </ul>
        
        
        
        
    </div>
}

function HelpTextImport(props) { 
    return <div style={{marginLeft:'0.5em'}}>
    <HelpMenu/>
            <h1>Importing Data</h1>
            <div>
                This tool can import files a variety of file formats and allows you to cherry pick intents, entities and utterances.
                <br/>
                You can use zip files to to upload and import many files that make up a skill for Mycroft, RASA or JOVO.
                <br/>
                This tool focuses on language training data and largely ignores other elements of the import formats including actions and routing stories or rules.
                
                <br/><br/>
                <br/>
                <h3>Supported File Types</h3>
                <h4>OpenNlu JSON</h4>
                The native format for this tool is a JSON based structure that describes a skill and related data. Grab and edit a skill from the search page to see the structure.
                <br/><br/>
                
                <h4>Text</h4>
                    Text files can be imported as intents, entities or utterances.<br/>
                    The editor for text files provides sort and transformation tools.<br/>
                    <ul>
                    <li>One record is created for each line in the import file.</li>
                    <li>When importing intents, multiple records are created for lines that use Mycroft style options expansion eg <i>the (man|woman|child) (walked to the (zoo|park)|ran to the train)</i></li>
                    <li>It is possible to use RASA style entity markup which is converted to entities on import.</li>
                    <li>When importing entities, ____ can be used to split a value and synonym from a line eg <i>synonymvalue____entityvalue</i></li>
                    <li>When importing utterances, ____ can be used to create many addition alternatives eg <i>hi there____gday____howsitgoing</i>  </li>
                    </ul>
                <br/><br/>
                
                <h4>RASA</h4>
                The tool can import rasa intent training data files in MD, JSON and YML(v2) format.<br/>
                Intents, entities, regular expressions (but not lookups) are imported.<br/><br/>
                A zip file containing a root level domain.yml and some .md or .json files can also be imported.<br/>
                Where the training data references lookup files, and those files are available in the zip, the lookup files will be used to import entities.
                <br/><br/>
                
                <h4>JOVO</h4>
                The tool can read either a single JSON model file or search in zip file for models/en-US.json.
                This file is used to import intents and entities and an invocation for the skill.
                <br/><br/>
                
                <h4>Mycroft</h4>
                The tool can read a zip file containing .dialog, .intent and .entity files.
                <br/><br/>
                
                <b>Mycroft and JOVO entity markers provide an entity type but no example value so intent entities are imported with the entity value as the entity type.</b><br/>
                To expand this data to include a selection of values, create some entities and tag them into a list then use the "Mix Entities" button on the Intents Editor page to mix entity values from the list back into your intent examples.
                
                
                
                
            </div>
            <hr/>
        </div>
}

function HelpTextTips(props) { 
    return <div style={{marginLeft:'0.5em'}}>
    <HelpMenu/>
            <h1>Tips and Tricks</h1>
            <div>
                
                 <h4>Multiple Selection</h4>
                You can use the shift key to select all records between the clicked row and the last selected row.<br/>
                Filters combined with select all is another technique to bulk select records. <br/>
                If you already have something selected, click once to clear selections and then again to select all.<br/>
                When records are selected, options for bulk manipulation are shown including bulk tag, bulk assign to skill, ...<br/>
                <br/><br/>
                
                <h4>What makes a good model ?</h4>
                A good machine learning model for Natural Language Understanding (NLU) has lots of well distributed examples of intents and entity values.<br/>
                <br/>
                A <a href="https://blog.bitext.com/improving-rasas-results-with-artificial-training-data-ii" target="_new" >quantitative analysis</a>  of accuracy vs amount of training data shows significant improvements in larger sets of training data and that this is particularly important when extracting entity values.
                <br/><br/>
                A detailed discussion of optimising intent and entity data is available on the <a href='https://blog.rasa.com/improving-entity-extraction/' target='_new' >RASA Blog</a> shows various techniques including the importance of including a selection of entity values in the intent examples to assist the model to integrate lookup entities.
                <br/>
                This tool implements one of the techniques by automatically tagging entities that are 'scrabble words'.
                <br/><br/>
                Tools like Chatito or Mycroft expansions eg show (me|us|everyone) the (dog|((|small) cat) cat be used to generate options but risk creating training data with poorly distributed examples that cause overfitting, introducing an excessive preference for some paths in the machine learning model so it less able to interpolate the dodgy inbetween ones.
                <br/>
                Used appropriately to integrate lists of entity values into intent examples for initial training data, these tools are invaluable.
                Distribution of examples in the model is improved by generating training data that include many variations in sentence structure as well as entity values.
                <br/><br/>
                Capturing user input to live systems will generate examples that significantly improve distribution in the models by including structures that were not conceived of in initial generated training data.
                <br/>
                Notably, these examples are like to contain non relevant cruft which is a pointer to another technique for improving initial training data.
                <br/><br/>
                
               
                
                <h4>Import from Mycroft/JOVO</h4>
                Data imported from Mycroft/JOVO does not include sample values for entities so you will need to edit each row with marked entities to provide some sample values.
                <br/><br/>
                
                <h4>Duplicates</h4>
                Duplicate and conflicting examples are allowed in the system. <br/>
                The skills page shows a warning when there are duplicate intent examples related to a skill. Clicking the button tags then shows all duplicate records.<br/>
                Delete the duplicate tags on any remaining records when you are finished resolving the duplicates by deleting or changing intent examples.
                <br/><br/>
                
                <h4>Limits</h4>
                The list/record editor is capable of handling tens of thousands of records.
                The import process may run out of memory for very large entity lists and require splitting into multiple imports.
                <br/><br/>
                
                
            </div>
            <hr/>
        </div>
}

function HelpTextAbout(props) { 
    return <div style={{marginLeft:'0.5em'}}>
    <HelpMenu/>
            <h1>About</h1>
<br/>
            <br/>
            <div>This application was written by Steve Ryan.</div>
             <div>The <a target="_new" href="https://github.com/syntithenai/opennludata" >source code</a> for this tool is available under an MIT Open Source Licence. </div>
            <div>Please share any feedback on the <a target="_new" href="https://github.com/syntithenai/opennludata/issues" >Github Issues Page</a></div>
            <br/>
            <hr/>
            
             <div>Icons from  The Noun Project and others.</div>
             <ul>
             <li>Man Singing by Gan Khoon Lay from  <a href='https://thenounproject.com/term/man-singing/642288/' target="_new" >The Noun Project</a></li>
             <li>Head by hunotika from <a href='https://thenounproject.com/term/head/184237/' target="_new" >The Noun Project</a></li>
             </ul>
             <hr/>
              <div>Using many open source libraries including</div>
                <ul>
                <li><a target="_new" href="https://www.npmjs.com/package/create-node-app" >create-node-app</a> </li>
                <li><a target="_new" href="https://github.com/syntithenai/react-express-oauth-login-system" >react-express-oauth-login-system</a> for oauth based login with support for social providers</li>
                <li><a target="_new" href="https://github.com/localForage/localForage" >localForage</a> for cross platform local persistence.</li>
                <li><a target="_new" href="https://github.com/florianholzapfel/express-restify-mongoose" >express-restify-mongoose</a> to simplify API development.</li>
                <li><a target="_new" href="https://github.com/bvaughn/react-window" >react-window</a> for virtual rendering, allowing for lists with many thousands of elements.</li>
                <li><a target="_new" href="https://github.com/josdejong/jsoneditor" >JSON editor</a> for editing uploaded sources.</li>
                <li>react, bootstrap, express, mongodb and mongoose</li>
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
                <li>RASA training data including MD, JSON and YML(v2) formats</li>
                <li>JOVO model files</li>
            </ul>
            </div>
            <div>The tool focuses on language training data and largely ignores other elements of the export formats including actions and routing stories or rules.
            For now, it is necessary to copy the downloaded language training data files into your skill folder.</div>
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
        <RemixEntitiesModal {...props} />
    </Fragment>

}

export { MatchesTallies,  HelpTextImport,HelpTextExport,HelpTextAbout,HelpText, NewFileButtons, ListsList, FileSelector, WithSelectedDropDowns, HelpTextTips}
