import React,{ useState } from 'react';
import FormControl from '@material-ui/core/FormControl';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import { GridContainer, GridItem } from "../../../components/Grid";


const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));


export default function CodedType(props) {
    const classes = useStyles();
    var data = props.codeddata;
    var uuid = data.uuid;

    const handleChange = (event) => {
      var btnid = event.target.id
      var cVal = {
        "name": uuid,
        "value":btnid
      }
      props.onChange(event,cVal)
    };

    return (
        <GridContainer>
            <GridItem item xs={12} sm={6} md={6}>
            <Typography variant="body1" className={classes.type}>
            {data.display}
            </Typography>
            </GridItem>
            <GridItem item xs={12} sm={6} md={6}>
            <FormControl component="fieldset" className="medication">

          <RadioGroup aria-label="gender" name="gender1" className="medi" >
          {data.answers.map((smoker, index) => (
            <FormControlLabel
              value={smoker.display}
              control={<Radio id={smoker.uuid} onChange={handleChange} />}
              label={smoker.display}
              className="yesClass"
              key={smoker.uuid}
            />
          ))}
          </RadioGroup>
            </FormControl>
                            <br></br>
            <br></br>

            </GridItem>
        </GridContainer>
    );
}