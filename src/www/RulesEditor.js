/* global window */
import React, {useState, useEffect} from 'react';
import {ListGroup, Button, Accordion, Card, AccordionContext, Form, Row, Col, Container} from 'react-bootstrap'
import { Link  } from 'react-router-dom'
import DropDownComponent from './components/DropDownComponent'
import DropDownSelectorComponent from './components/DropDownSelectorComponent'
import Autosuggest from 'react-autosuggest'

    

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};


function RulesEditor(props) {
    
    //var [triggerIntent]
    var [rules,setRules] = useState([])
    const [searchFilter, setSearchFilter] = useState('')
    const [ruleFilter, setRuleFilter] = useState('')
    const [newRuleName, setNewRuleName] = useState('')
    const [suggestions, setSuggestions] = useState([])
    
    //console.log(['USE EFFECT RULES',props])
    useEffect(() => {
        var newRules = []
        // convert props array of rules to keyed object of rules
        if (Array.isArray(props.rules) && props.rules.length > 0) {
            props.rules.map(function(rule) {
                if (rule && Array.isArray(rule.steps) && rule.steps.length > 0  && rule.steps[0] && rule.steps[0].indexOf('intent ') === 0) {
                    var intentName = rule.steps[0].slice(7)
                    if (intentName) {
                        newRules.push({name: rule.rule, triggerIntent: intentName, steps: rule.steps.slice(1)})
                    }
                }
            })
            setRules(newRules)
        } else {
            setRules([])
        }
        //console.log(['USE EFFECT RULES',props.rules,rules])
    },[props.rules])
    
    
        
    function toRulesArray() {
        var final = []
        //console.log(['TORULES',Object.values(rules)])
        rules.map(function(rule) {
            console.log(rule)
           //if (rule.triggerIntent) 
           final.push( {rule:rule.name, steps: [].concat(['intent ' + rule.triggerIntent],rule.steps)}  )
           return null
        })
        return final
    }

    //function filterUsedInRuleIntents(intents) {
        ////console.log(['filter',intents,rules])
        //var newIntents=[]
        //var usedIntents = {}
            
        //if (rules) {
            //Object.keys(rules).map(function(rule) {
                ////if (rule && Array.isArray(rule.steps) && rule.steps.length > 0 && rule.steps[0]) {
                    //usedIntents[rule] = 1
                    //return null
                ////}
            //})
        //}
        ////console.log(usedIntents)
        //if (Array.isArray(intents)) {
            ////console.log(usedIntents)
            //intents.map(function(intent) {
                //if (!usedIntents[intent]) {
                    //newIntents.push(intent)
                //}  
            //})
        //}
        //return newIntents
    //} 
    
    function save(newRules) {
        setRules(newRules)
        console.log(['SAVERULES',toRulesArray()])
        props.setRules(toRulesArray())
    }
    
    function setRuleName(ruleKey,ruleName) {
        //console.log(['setrulename',ruleKey,ruleName,rules])
        var newRules = rules
        if (ruleName && newRules[ruleKey]) newRules[ruleKey].name = ruleName
        save(newRules)
    }
    
        
    function addRule(intent) {
        var newRules = rules
        newRules.unshift({name:(newRuleName && newRuleName.trim()) ? newRuleName : intent, triggerIntent: intent, steps:[]})
        save(newRules)
    }

    function deleteRule(ruleKey) {
        if (window.confirm('Really delete the rule ?')) {
            //console.log(['del',intent])
            var newRules = rules
            newRules.splice(ruleKey,1)
            save(newRules)
        }
    }

    function addRuleStep(ruleKey,type) {
        console.log(['ADDSTEP',ruleKey,type])
        var newRules = rules
        var newRule = newRules[ruleKey]
        if (newRule) {
            if (!Array.isArray(newRule.steps)) newRule.steps=[]
            newRule.steps.push(type+' ')
            newRules[ruleKey] = newRule
            console.log(['ADDSTEP RULES',newRules])
            save(newRules)
        }
    }
    
    function updateRuleStep(ruleKey,key,step) {
        //console.log(['update rules step',intent,key,step])
        var newRules = rules
        var newRule = newRules[ruleKey]
        if (newRule.steps) {
            newRule.steps[key] = step
            newRules[ruleKey] = newRule
            save(newRules)
        }
    }
    
    function updateRuleTriggerIntent(ruleKey,intent) {
        //console.log(['update rules step',intent,key,step])
        var newRules = rules
        var newRule = newRules[ruleKey]
        if (newRule) {
            newRule.triggerIntent = intent
            newRules[ruleKey] = newRule
            save(newRules)
        }
    }

    function deleteRuleStep(ruleKey,indexIn) {
        if (window.confirm('Really delete step?')) {
            var newRules = rules
            const index = parseInt(indexIn)
            if (rules && rules[ruleKey] && Array.isArray(rules[ruleKey].steps) && index !== NaN ) {
                newRules[ruleKey].steps.remove(index)
            }
            save(newRules)
        }
    }


    function moveRuleUp(ruleKey) {
        //console.log(['moveup',intent,index,rules])
        var newRules = rules
        if (Array.isArray(rules[ruleKey]) && ruleKey > 0) {
            const tmp = rules[ruleKey]
            rules[ruleKey] = rules[ruleKey-1]
            rules[ruleKey-1] = tmp
            //console.log(['swapped',index,JSON.stringify(rules[intent].steps)])
        }
        save(newRules)
    }

    function moveRuleDown(ruleKey) {
        var newRules = rules
        //console.log(['movedown',intent,index,rules])
        if (Array.isArray(rules)  && ruleKey <= rules.length ) {
            const tmp = rules[ruleKey + 1]
            if (tmp) {
                rules[ruleKey + 1] = rules[ruleKey]
                rules[ruleKey] = tmp
                //console.log(['swapped',index,JSON.stringify(rules[intent].steps)])
            }
            // else console.log('notmpe')
        }
        save(newRules)
    }

    function moveRuleStepUp(ruleKey,index) {
        //console.log(['moveup',intent,index,rules])
        var newRules = rules
        if (rules && rules[ruleKey] && Array.isArray(rules[ruleKey].steps) && index > 0) {
            const tmp = rules[ruleKey].steps[index]
            rules[ruleKey].steps[index] = rules[ruleKey].steps[index-1]
            rules[ruleKey].steps[index-1] = tmp
            //console.log(['swapped',index,JSON.stringify(rules[intent].steps)])
        }
        save(newRules)
    }

    function moveRuleStepDown(ruleKey,index) {
        var newRules = rules
        //console.log(['movedown',intent,index,rules])
        if (rules && rules[ruleKey] && Array.isArray(rules[ruleKey].steps)  && index <= rules[ruleKey].steps.length ) {
            const tmp = rules[ruleKey].steps[index + 1]
            if (tmp) {
                rules[ruleKey].steps[index + 1] = rules[ruleKey].steps[index]
                rules[ruleKey].steps[index] = tmp
                //console.log(['swapped',index,JSON.stringify(rules[intent].steps)])
            }
            // else console.log('notmpe')
        }
        save(newRules)
    }

    // STEP AUTOCOMPLETE FUNCTIONS
    function searchShowAll() {
        //setSearchResults(Object.values(props.lookups.skills))
    }

  
    // Use your imagination to render suggestions.
    const renderSuggestion = suggestion => (
        <div>
        {suggestion.tag}
        </div>
    );
    // Autosuggest will call this function every time you need to update suggestions.
    function onSuggestionsFetchRequested ({ value }) {
         
    };

    // Autosuggest will call this function every time you need to clear suggestions.
    function  onSuggestionsClearRequested()  {
       setSuggestions([]);
    };

    
    
    return (
        <div>

        
     
            <label style={{float:'left'}}>
              <input type='text' value={newRuleName} onChange={function(e) {setNewRuleName(e.target.value)}} />
            </label>
            <label style={{float:'left'}}>
                <DropDownSelectorComponent  
                    variant = {((newRuleName && newRuleName.trim()) ? "success" : "secondary")} 
                    title="New Rule" 
                    options={((newRuleName && newRuleName.trim()) ? (['welcome','fallback'].concat(props.intents)) : []) } selectItem = {function(v) {addRule(v)}} /> 
            </label>
            <input style={{marginLeft:'2em'}}  type='text' value={ruleFilter} onChange={function(e) {setRuleFilter(e.target.value)}} placeholder={'Filter rules'} /><Button variant="danger" onClick={function() {setRuleFilter('')}} >X</Button>
            
            {Array.isArray(rules) && <div><form onSubmit={function(e) {e.preventDefault(); return false}} >
                {rules.map(function(rule,key) {
                    var triggerIntent  = rule.triggerIntent
                    //console.log(ruleFilter && ruleFilter.trim(),triggerIntent.indexOf(ruleFilter) )
                    if (ruleFilter && ruleFilter.trim() && (triggerIntent.indexOf(ruleFilter) === -1 && (rule && rule.name && rule.name.indexOf(ruleFilter) === -1))) {
                        return null
                    } else {
                        
                        var steps = (Array.isArray(rule.steps) && rule.steps.length > 0) ? rule.steps : []
                       return (
                       <div key={key} style={{clear:'both'}}>
                       <hr style={{clear:'both', width:'100%'}} />
                       <Button style={{float:'right', width:'10em', marginBottom:'0.5em'}} size="sm" variant="danger" onClick={function(e) {deleteRule(key)}} > Delete Rule </Button>
                       
                       &nbsp;&nbsp;<Button variant="primary" onClick={function(e) {moveRuleUp(key)}} > ^ </Button> 
                       &nbsp;<Button variant="primary" onClick={function(e) {moveRuleDown(key)}} > v </Button>
                                    
                                    
                        <span><label style={{fontWeight:'bold', marginLeft:'1em'}} >Trigger Intent </label> <DropDownSelectorComponent  variant = "primary" title={triggerIntent} options={[].concat(['welcome','fallback',triggerIntent],props.intents)} selectItem = {function(v) {
                            updateRuleTriggerIntent(key,v)
                        }} /></span>
                        
                       <span  >&nbsp;&nbsp;<label style={{fontWeight:'bold'}} >Description </label> <input size='40' type='text' value={rule.name} onChange={function(e) {setRuleName(key, e.target.value)}} /></span>  
                       
                        <div  style={{clear:'both', width: '100%'}}  >
                            <div style={{fontWeight:'bold', width: '100%'}} >
                            {steps.map(function(step,stepKey) {
                                var parts = step.split(' ')
                                var ruleStepType = parts[0].trim()
                                var ruleStepName = parts.slice(1).join(' ')
                                //console.log(props.lookups)
                                var suggestions = []
                                var createNewLabel = 'Create New '
                                var clickCreate = null //function(e) {}
                                var editLink=''
                                if (ruleStepType === "utter") {
                                    createNewLabel = createNewLabel + 'Utterance '
                                    suggestions = props.utterances ? props.utterances.filter(function(a) {if (a.indexOf(ruleStepName) !== -1) {return true} else return false }).sort() : []
                                    clickCreate = function(e) {
                                        props.createUtterance({name:ruleStepName}).then(function() {
                                                setTimeout(props.updateFunctions.updateUtterances,500)
                                        })
                                    }
                                    editLink = '/utterances/filter/'+ruleStepName+'/fromskill/'+props.skillFilterValue
                                }
                                if (ruleStepType === "action") {
                                    createNewLabel = createNewLabel + 'Action '
                                    suggestions = props.actions ? props.actions.filter(function(a) {if (a.indexOf(ruleStepName) !== -1) {return true} else return false }).sort() : []
                                    clickCreate = function(e) {
                                        props.createAction(ruleStepName).then(function() {
                                                setTimeout(props.updateFunctions.updateActions,500)
                                        })
                                    }
                                    editLink = '/actions/filter/'+ruleStepName+'/fromskill/'+props.skillFilterValue
                                }
                                
                                if (ruleStepType === "form") {
                                    createNewLabel = createNewLabel + 'Form '
                                    suggestions = props.lookups.formsLookups ? props.lookups.formsLookups.filter(function(a) {if (a.indexOf(ruleStepName) !== -1) {return true} else return false }).sort() : []
                                    clickCreate = function(e) {
                                        props.createForm(ruleStepName).then(function() {
                                                setTimeout(props.updateFunctions.updateForms,500)
                                        })
                                    }
                                    editLink = '/forms/filter/'+ruleStepName+'/fromskill/'+props.skillFilterValue
                                }
                                if (ruleStepType === "checkpoint") {
                                    createNewLabel = createNewLabel + 'Checkpoint '
                                    suggestions = []
                                    //clickCreate = function(e) {
                                        //props.createAction({name:ruleStepName}).then(function() {
                                                //setTimeout(props.updateFunctions.updateActions,500)
                                        //})
                                    //}
                                }
                                
                                // TODO
                                //var suggestions = (ruleStepType === "utter") ? (props.utterances ? props.utterances.filter(function(a) {if (a.indexOf(ruleStepName) !== -1) {return true} else return false }).sort() : []) : ((ruleStepType === "action") ? (props.actions ? props.actions.filter(function(a) {if (a.indexOf(ruleStepName) !== -1) {return true} else return false }).sort() : []) : [])
                                
                                
                                return <div  style={{width: '100%'}} key={stepKey} >
                                <br/>
                                <span style={{float:'left', clear:'both'}} >
                                    {<Button  variant="danger" onClick={function(e) {e.preventDefault(); deleteRuleStep(key,stepKey)}} > X </Button>}
                                    
                                    &nbsp;&nbsp;<Button variant="primary" onClick={function(e) {moveRuleStepUp(key,stepKey)}} > ^ </Button> 
                                    &nbsp;<Button variant="primary" onClick={function(e) {moveRuleStepDown(key,stepKey)}} > v </Button>
                                   
                                    &nbsp;&nbsp;<b>{ruleStepType.padEnd(12,' ')}&nbsp;&nbsp;</b>
                                </span>
                                <span style={{float:'left', width:'50em', display:'inline'}} >
                                       <Autosuggest
                                            suggestions={suggestions.map(function(suggestion) {return {tag: suggestion}})}
                                            shouldRenderSuggestions={function() {return true}}
                                            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                                            onSuggestionsClearRequested={onSuggestionsClearRequested}
                                            getSuggestionValue={function (suggestion)  { return suggestion.tag}}
                                            renderSuggestion={renderSuggestion}
                                            onSuggestionSelected={function(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
                                                updateRuleStep(key,stepKey,ruleStepType + ' '+suggestionValue)
                                            }}
                                            inputProps={{
                                                style:{width:'30em', display:'inline', float:'left'},
                                              value: ruleStepName,
                                              onChange: function(e) {updateRuleStep(key,stepKey,ruleStepType + ' '+e.target.value)}
                                            }}
                                        />
                                        
                                        {(typeof clickCreate === 'function' && suggestions.indexOf(ruleStepName) === -1) && (
                                            <span >{ruleStepName && <Button 
                                                style={{marginLeft:'1em'}} 
                                                onClick={clickCreate}
                                                variant="success">
                                                    {createNewLabel}
                                            </Button>}</span>
                                        )}
                                        
                                        
                                        
                                        {(editLink && suggestions.indexOf(ruleStepName) !== -1) && <Link to={editLink} ><Button style={{marginLeft:'1em'}} variant="primary">Edit</Button></Link>}
                                </span>
                               
                               </div>
                            })}
                            <span style={{float:'left', clear:'both'}}  ><br/><DropDownSelectorComponent  variant = "success" title={'New Step'} options={['utter','action','form']} selectItem = {function(v) {addRuleStep(key,v)}} /></span>
                            </div> 
                            <span style={{float:'left', clear:'both'}} ><br/><br/></span>
                        </div>
                        
                       </div>
                        )
                    }
                })}
             </form> </div>}
        </div>
    )
}


export default RulesEditor

