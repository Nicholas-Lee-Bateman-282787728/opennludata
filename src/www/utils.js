//const yaml = require('js-yaml');
// FUNCTIONS 
var balanced = require('balanced-match');

const RASA = {
    slotTypes : {
        'unfeaturized': {},
        'text': {},
        'bool': {},
        'list': {},
        'float': {'min_value':'int', 'max_value':'int'},
        'categorical': {'values':'list'}
    },
    autofillOptions: ['Yes','No']
}

// https://cloud.google.com/dialogflow/docs/reference/system-entities
const GoogleAssistant = {
    entityTypes: ["@sys.date-time","@sys.date","@sys.date-period","@sys.time","@sys.time-period","@sys.number","@sys.cardinal","@sys.ordinal","@sys.number-integer","@sys.number-sequence","@sys.flight-number","@sys.unit-area","@sys.unit-currency","@sys.unit-length","@sys.unit-speed","@sys.unit-volume","@sys.unit-weight","@sys.unit-information","@sys.percentage","@sys.temperature","@sys.duration","@sys.age","@sys.currency-name","@sys.unit-area-name","@sys.unit-length-name","@sys.unit-speed-name","@sys.unit-volume-name","@sys.unit-weight-name","@sys.unit-information-name","@sys.address","@sys.zip-code","@sys.geo-capital","@sys.geo-country","@sys.geo-country-code","@sys.geo-city","@sys.geo-state","@sys.place-attraction","@sys.airport","@sys.location","@sys.email","@sys.phone-number","@sys.person","@sys.music-artist","@sys.music-genre","@sys.color","@sys.language","@sys.any","@sys.url"]
}

//https://developer.amazon.com/en-US/docs/alexa/custom-skills/slot-type-reference.html",
const Alexa = {
    entityTypes: ["AMAZON.DATE","AMAZON.DURATION","AMAZON.FOUR_DIGIT_NUMBER","AMAZON.NUMBER","AMAZON.Ordinal","AMAZON.PhoneNumber","AMAZON.TIME","AMAZON.SearchQuery","AMAZON.Actor","AMAZON.Airline","AMAZON.Airport","AMAZON.Anaphor","AMAZON.Animal","AMAZON.Artist","AMAZON.Author","AMAZON.Book","AMAZON.City","AMAZON.Color","AMAZON.Corporation","AMAZON.Country","AMAZON.CreativeWorkType","AMAZON.DayOfWeek","AMAZON.FictionalCharacter","AMAZON.FirstName","AMAZON.Food","AMAZON.Genre","AMAZON.Language","AMAZON.Month","AMAZON.Movie","AMAZON.MusicAlbum","AMAZON.MusicGroup","AMAZON.Musician","AMAZON.MusicRecording","AMAZON.Person","AMAZON.RadioChannel","AMAZON.Region","AMAZON.RelativePosition","AMAZON.Room","AMAZON.Sport","AMAZON.StreetName","AMAZON.TVSeries","AMAZON.VideoGame","AMAZON.VisualModeTrigger"]
}
const BuiltinTypes = {
    entityTypes: ["Date", "Number", "URL", "Email", "Phone Number", "Hashtag", "Person", "Place", "Organization"]
}

function toSnakeCase(str) {
    return str.toLowerCase().replace(/[^a-z]/g, '_').replace('__','_')
}

const snakeToCamelCase = (str) => str.replace(
    /([-_][a-z])/g,
    (group) => group.toUpperCase()
                    .replace('-', '')
                    .replace('_', '')
);

const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);



function generateObjectId() {
    var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
}
   
function parentUrl(url) {
    return url.split("/").slice(0,-1).join("/") 
}

function concatText(text,words) {
   let parts = text.split(' ')
   let shorter = parts.slice(0,20).join(' ')
   return (shorter.length < text.length) ? shorter + '...' : shorter;
}



    
    function findFirstDiffPos(a, b) {
      if (a === b) return -1;
      for (var i=0; a[i] === b[i]; i++) {}
      return i;
    }
    
    function multiplyArrays(a,b) {
        var results=[]
        a.map(function(aval) {
              b.map(function(bval) {
                  results.push(aval + bval)
              })
        })
        return results
    }

    function uniquifyArray(a) {
        ////console.log(['UNIQARRAY',a])
        if (Array.isArray(a)) {
            var index = {}
            a.map(function(value) {
                index[value] = true 
                return null
            })
            return Object.keys(index)
        } else {
            return []
        }
    }

    function uniquifyArrayOfObjects(a,field) {
         if (Array.isArray(a)) {
             var index = {}
            var emptyIndex = null
            a.map(function(value) {
                if (value) {
                    if (value[field]) {
                        index[value[field]] = value 
                    } else {
                        emptyIndex = value
                    }
                }
                return null
            })
            if (emptyIndex) return [emptyIndex].concat(Object.values(index))
            else return Object.values(index)
        } else {
            return []
        }
    }
    
    // recursively expand sentence containing options eg (the|an(y|)|my) into an array of expanded sentences
    function expandOptions(text) {
        var options = []
        var b = balanced('(',')',text)
        if (b && b.body) {
            var innerOptions = null
            var ib = balanced('(',')',b.body)
            if (ib) {
                innerOptions = expandOptions(b.body)
            } else {
                innerOptions = b.body.split("|")
            }
            innerOptions = uniquifyArray(innerOptions)
            var sentences = uniquifyArray(multiplyArrays(multiplyArrays([b.pre],innerOptions),[b.post]))
            sentences.map(function(sentence) {
               options=[].concat(options,expandOptions(sentence))  
            })
        } else {
            options = text.split("|")
        }
        return uniquifyArray(options)
    }
    
    function replaceEntities(example,entities) {
        // replace entity values with {entityName}
        // first sort entities by start key
        entities = entities.sort(function(a,b) {
          if (a.start < b.start) return -1
          else return 1  
        })
        var offset = 0
        var newExample = example
        entities.map(function(entity) {
            newExample = newExample.slice(0,entity.start + offset)+"{"+entity.type+"}"+newExample.slice(entity.end + offset)
            var diff = (entity.end - entity.start) - (entity.type.length + 2)
            offset -= diff
            return null
        })
        return newExample
    }
    
    function replaceEntitiesWithValues(example,entities) {
        // replace entity values with {entityName}
        // first sort entities by start key
        if (example && Array.isArray(entities)) {
                entities = entities.sort(function(a,b) {
              if (a.start < b.start) return -1
              else return 1  
            })
            var offset = 0
            var newExample = example
            entities.map(function(entity) {
                var replacement = "["+entity.value+"]("+entity.type+")"
                newExample = newExample.slice(0,entity.start + offset)+replacement+newExample.slice(entity.end + offset)
                var diff = (entity.end - entity.start) - (replacement.length)
                offset -= diff
                return null
            })
            return newExample
        } else {
            return example
        }
    }
    
    
    
    /**
     *  create array by splitting on newline and fullstop
     */
    function splitSentences(text) {
        console.log(['splitsent',text])
      var final = []
      if (text) {
          // split by newline and full stop
         var splits = text.split('\n').join('::::').split('.').join('::::').split('::::') //.map(function(value) { return value.trim()})
        // trim all splits
        for (var id in splits) {
            var splitText= splits[id] && splits[id].trim && splits[id].trim() ? splits[id].trim() : ''
            if(splitText.length > 0) final.push(splitText)
        }
     }
     //console.log(['splitsent',JSON.stringify(final),JSON.stringify(splits)])
     return final;
    }
    
    
    function cleanText(intent) {
        return intent.replaceAll('.','_').replaceAll(',','_').replaceAll(' ','_').trim()
    }
    
    function cleanIntent(intent) {
        return cleanText(intent)
    }
    
    function cleanEntity(entity) {
        return cleanText(entity)
    }
    
    function cleanUtterance(utterance) {
        return cleanText(utterance)
    }

    function cleanRegexp(regexp) {
        return cleanText(regexp)
    }
  


export {cleanUtterance, cleanIntent, cleanEntity, cleanRegexp,  generateObjectId, parentUrl, concatText , findFirstDiffPos,uniquifyArray, multiplyArrays, expandOptions, splitSentences, uniquifyArrayOfObjects, replaceEntities,replaceEntitiesWithValues, BuiltinTypes,   RASA, GoogleAssistant, Alexa, snakeToCamelCase, camelToSnakeCase, toSnakeCase }
