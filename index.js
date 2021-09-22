let copyBtn = document.querySelector("#copy");
let toastBdy = document.querySelector(".toast-body");
let toRemoveInput = document.querySelector("#removeThese");
let toClassifyInput = document.querySelector("#toClassify");
let redactBtn = document.querySelector("#redact");
let removedThese = document.querySelector("#removedThese");
let ignorCaseCheckbox = document.querySelector('#ignoreCase');
let ignoreSpecialsCheckbox = document.querySelector('#ignoreSpecials');

const checkForPairedQuote = (str) => {
  const single = /\'/g;
  const double = /\"/g;

  const singles = str.match(single);
  const doubles = str.match(double);

  if(singles.length % 2 != 0 || doubles.length % 2 != 0){
    return false;
  }
  return true;
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(removedThese.value)
  .then(() => {
    toastBdy.textContent = "Classified Document Copied!";
  })
  .catch(() => {
    toastBdy.textContent = "Something went wrong.";
  })
  .then(() => {
    $('.toast').toast("show");
  });
}

const generateRedactionList = (str) => {
  let copy = '';
  let inAdblQuote = false;
  let inAsnglQuote = false;

  for(let i = 0; i < str.length; i++){
    switch(str[i]){
      case "\"":
        if(inAsnglQuote){ //nested quotes of different quotation mark type
          copy += str[i];
        }  
        inAdblQuote = !inAdblQuote;
        break;

      case "'":
        if(inAdblQuote){
          copy += str[i];
        } 
        inAsnglQuote = !inAsnglQuote;
        break;

      case " ": // swapping spaces for commas for consistency
        !inAdblQuote && !inAsnglQuote ? copy += ',' : copy += str[i];
        break;

      case ",": // copy them only if quotes
        if(inAdblQuote || inAsnglQuote){
          copy += ',';
        }
        break;

      default:
        if(str[i].charCodeAt(0) >= 33 && str[i].charCodeAt(0) <= 48){
          if(!ignoreSpecialsCheckbox.checked){
            copy += str[i];
          }
        }else{
          copy += str[i]; 
        }
    }
  }

  return copy.split(',').filter((el) => el.trim() !== '');
}

const redactWords = () => {
  let error;

  if(!toRemoveInput.value || !toClassifyInput.value){
    error = "Both inputs are required!"
  }else if(checkForPairedQuote(toRemoveInput.value) == false){
    error = "Missing quotation mark in 'Words to remove'!";
  }

  if(error){
    toastBdy.textContent = error;
    $('.toast').toast("show");
    return;
  }

  let removeThese = generateRedactionList(toRemoveInput.value);
  let classified = removeClassifiedWords(removeThese, toClassifyInput.value);

  removedThese.value = classified;
}

const removeClassifiedWords = (words, text) => {
  let final = text;

  words.forEach((word) => {
    let regex = new RegExp("\\b"+word+"\\b", ignorCaseCheckbox.checked ? 'ig' : 'g'); 
    //deals with compound words and end of input
    //regex boundary does not play nice with specials at the start/end of a string
    final = final.replace(regex, 'X'.repeat(word.length));
  });
  
  
  return final;
}

redactBtn.addEventListener("click", redactWords);
copyBtn.addEventListener("click", copyToClipboard);

//todo create some test inputs
