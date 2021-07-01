import React,{useState} from 'react';
import Alert from '@material-ui/lab/Alert';

import CodedType from './codedType'
import TextType from './textType'
import PS_Level2_History from './ps_level2_history';

export default function PS_History(props) {
  var data = props.answer;
  var dataType = props.answer.datatype.display
  var [successcheck, setSuccesscheck] = useState(false);
  var NON_SMOKE = ["Never Smoker","Ex Smoker"]
  var NON_ALCOHOLIC = "Non Alcoholic"
  var ps_level_1 = data.answers;
  var uuid= data.uuid;
  var [showSmoke, setShowSmoke] = useState();
  var [showAlcoholic, setShowAlcoholic] = useState(false);
  var [successcheck, setSuccesscheck] = useState(false);
  var [smokingCap, setSmokingCap] = useState([]);
  var [alcoholCap, setAlcoholCap] = useState([]);
  var uuidList = [];
  var [allpsuuid, setAllpsuuid] = useState([]);

  ps_level_1.forEach(function (item, index) {
    var title = item.display;

    if (!NON_SMOKE.includes(title)) {
      if (title.indexOf("Smoker") > -1) {
        if (smokingCap.length == 0) {
          setSmokingCap(item.answers)
        }
      }
      else if (title != NON_ALCOHOLIC) {
      if (title.indexOf("Alcoholic") > -1) {
        if (alcoholCap.length == 0) {
          setAlcoholCap(item.answers)
        }
      }
    }
    }

  });

  const handleChange = (event,cVal) => {
    var btnid = event.target.id
    var btnvalue = event.target.value
    var cVal = {
      "name": uuid,
      "value":btnid
    }
    if (!NON_SMOKE.includes(btnvalue) && btnvalue != NON_ALCOHOLIC) {
      if (btnvalue.indexOf("Smoker") > -1) {
        setShowSmoke(true);
          smokingCap.forEach(function (itemva, index) {
            uuidList.push(itemva.uuid)
            setAllpsuuid(uuidList);
          });
      }
      else if (btnvalue != NON_ALCOHOLIC) {
      if (btnvalue.indexOf("Alcoholic") > -1) {
        setShowAlcoholic(true);
        alcoholCap.forEach(function (itemva, index) {
          uuidList.push(itemva.uuid)
          setAllpsuuid(uuidList);
        });
      }
      else {
      setShowSmoke(false);
      setShowAlcoholic(false)

    }
    }
    }
    else if (NON_SMOKE.includes(btnvalue)) {
      setShowSmoke(false);
      props.onDelete(event,allpsuuid)
    }
    else if (btnvalue == NON_ALCOHOLIC) {
      setShowAlcoholic(false)
      props.onDelete(event,allpsuuid)
    }
    else {
      setShowSmoke(false);
      setShowAlcoholic(false)
    }
    props.onChange(event,cVal)
  };

  const handleValueChange = (event,cVal) => {
    setSuccesscheck(false);
    props.onChange(event,cVal)
  };

  if (dataType == "Coded") {
      return (
        <div>
          <CodedType codeddata={data}
            onChange={handleChange}
          />

          {showSmoke &&
              smokingCap.map((item, index) => (
                    <PS_Level2_History
                  answer={item}
                  onChange={handleValueChange}
                  key={item.uuid}
                    />
              ))
          }

          {showAlcoholic &&
              alcoholCap.map((item, index) => (
                    <PS_Level2_History
                  answer={item}
                  onChange={handleValueChange}
                  key={item.uuid}
                    />
              ))
          }
          </div>
        )
    }
    else if (data.datatype.display == "Text" || data.datatype.display == "N/A") {
      return (
        <div>
          <TextType textdata={data}
            onChange={handleValueChange} />
        {successcheck &&
        <Alert severity="success">Saved Successfully!</Alert>
        }
        </div>
      )
    }
}