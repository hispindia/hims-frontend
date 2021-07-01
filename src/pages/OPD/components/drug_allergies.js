import React,{useState} from 'react';
import Alert from '@material-ui/lab/Alert';

import CodedType from './codedType'
import TextType from './textType'

export default function DrugHistory(props) {
  var data = props.answer;
  var uuidDrug = props.uuidDrug;
  var uuidNonDrug = props.uuidNonDrug;

  var parentUuid = ""
  if (uuidDrug) {
    parentUuid = uuidDrug;
  }
  else if (uuidNonDrug) {
    parentUuid = uuidNonDrug;
  }
  var dataType = data.datatype.display

  const handleChange = (event, cVal) => {
      props.onChange(event,cVal)
    };

    if (dataType == "Coded") {
    return (
      <div>
        <CodedType
          codeddata={data}
          parentUuid = {parentUuid}
          onChange = {handleChange}
        />
      </div>
      )
    }
    else if (dataType == "Text" || dataType == "N/A") {
    return (
      <div>
        <TextType
        textdata={data}
          onChange={handleChange}
          parentUuid = {parentUuid}
        />
      </div>
    )
    }
}