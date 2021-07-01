import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './index.css';
import { Collapse } from 'antd';
import { Select } from 'antd';
import { GridContainer, GridItem } from "../../components/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import ImmunizationTable from './components/immunization_history'
import MedicationHistory from './components/medication_history'
import SurgicalHistory from './components/surgical_history'
import PS_History from './components/ps_history'
import FamilyHistory from './components/family_history'
import AllergyHistory from './components/allergy_history'



const useStyles = makeStyles((theme) => ({
  formControl: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    minWidth: 120,
    maxWidth: 300,
  },
  root: {
    flexGrow: 1,
  },
}));

const { Panel } = Collapse;

const ControlledAccordions = (props) => {
  const classes = useStyles();
  var [immunization, setImmunization] = useState({});
  var [value, setValue] = useState("");
  var IMMUNIZATION_HISTORY = "Immunization History"
  var MEDICATION_HISTORY = "Medication History"
  var SURGICAL_HISTORY = "Surgical History"
  var PS_HISTORY = "Personal and Social History"
  var FAMILY_HISTORY = "Family History"
  var ALLERGY_HISTORY = "Allergies History"
  var patientData = props.rowdata;
  var savedValues = props.savedValues;

  const onChange = (event, key) => {
    setImmunization({
      ...immunization,
      [key]:event.target.value.display
    })
  };

  const handleChange = (event, cVal) => {
    props.onChange(event,cVal)
  };

  const deleteChange = (event,cVal) => {
    props.onDelete(event,cVal)
  };

  const itemImmuneList = (items) => {
      // return items.answers.map((item1, index) => (
       return( <ImmunizationTable
          rows={items}
         patientData={patientData}
         onChange = {handleChange}
    />
       )
    // ))
  };

  const itemSurgicalList = (items) => {
    return items.answers.map((item1, index) => (
      <SurgicalHistory
        answer={item1}
        onChange = {handleChange}
      />
    ))
  };

  const itemSocialList = (items) => {
    return items.answers.map((item1, index) => (
      <PS_History
        answer={item1}
        onChange={handleChange}
        onDelete={deleteChange}
      />
    ))
  };

  const itemFamilyList = (items) => {
    return items.answers.map((item1, index) => (
      <FamilyHistory
        answer={item1}
        onChange={handleChange}
        onDelete={deleteChange}
      />
    ))
  };

  const itemAllergyList = (items) => {
    return items.answers.map((item1, index) => (
      <AllergyHistory
        answer={item1}
        onChange={handleChange}
        onDelete={deleteChange}
        savedValues = {savedValues}
      />
    ))
  };

    const itemMedicationList = (items) => {
    return items.answers.map((item1, index) => (
      <MedicationHistory
        question={item1}
        onChange = {handleChange}
      />
    ))
  };

return(
  <Collapse accordion>
    {props.historyfields.map((item, index) => (
      <Panel header={item.display} key={index}>
          {item.display == IMMUNIZATION_HISTORY &&
          itemImmuneList(item)
            }
          {item.display == MEDICATION_HISTORY &&
            itemMedicationList(item)
          }
        {item.display == SURGICAL_HISTORY &&
          itemSurgicalList(item)
          }
          {item.display == PS_HISTORY &&
            itemSocialList(item)
          }
          {item.display == FAMILY_HISTORY &&
            itemFamilyList(item)
          }
          {item.display == ALLERGY_HISTORY &&
            itemAllergyList(item)
          }
      </Panel>
    ))}
  </Collapse>
)
}

export default ControlledAccordions;