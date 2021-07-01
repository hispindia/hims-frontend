import React,{useState} from 'react';
import Alert from '@material-ui/lab/Alert';

import CodedType from './codedType'
import TextType from './textType'
import Famiily_Level2_History from './family_history_level2'

export default function FamilyHistory(props) {

    var data = props.answer;
    var dataType = props.answer.datatype.display
    var [successcheck, setSuccesscheck] = useState(false);
    var FATHER_ALIVE = "Father Alive - No"
    var MOTHER_ALIVE = "Mother Alive - No"
    var family_level_1 = data.answers;
    var uuid= data.uuid;
    var [showMotherDead, setShowMotherDead] = useState();
    var [showFatherDead, setShowFatherDead] = useState();
    var [deadMotherDetails, setDeadMotherDetails] = useState([]);
    var [deadFatherDetails, setDeadFatherDetails] = useState([]);
    var uuidList = [];
    var [allfamilyuuid, setAllfamilyuuid] = useState([]);


    family_level_1.forEach(function (item, index) {
    var title = item.display;
      if (title.indexOf(MOTHER_ALIVE) > -1) {
        if (deadMotherDetails.length == 0) {
          setDeadMotherDetails(item.answers)
        }
      }
      if (title.indexOf(FATHER_ALIVE) > -1) {
        if (deadFatherDetails.length == 0) {
          setDeadFatherDetails(item.answers)
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
    deadMotherDetails.forEach(function (itemva, index) {
    uuidList.push(itemva.uuid)
    setAllfamilyuuid(uuidList);
    });

    deadFatherDetails.forEach(function (itemva, index) {
    uuidList.push(itemva.uuid)
    setAllfamilyuuid(uuidList);
    });

      if (btnvalue.indexOf(MOTHER_ALIVE) > -1) {
        setShowMotherDead(true);
      }
      else if (btnvalue.indexOf(FATHER_ALIVE) > -1) {
        setShowFatherDead(true);

      }
      else {
      setShowMotherDead(false);
      setShowFatherDead(false);
      props.onDelete(event,allfamilyuuid)

    }
    setSuccesscheck(false);
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

          {showMotherDead &&
              deadMotherDetails.map((item, index) => (
                    <Famiily_Level2_History
                  answer={item}
                  onChange={handleValueChange}
                  key={item.uuid}
                    />
              ))
          }

          {showFatherDead &&
              deadFatherDetails.map((item, index) => (
                    <Famiily_Level2_History
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
          <TextType textdata={data} onChange={handleValueChange} />
        </div>
      )
    }
}