import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import MomentUtils from "@date-io/moment";
import { useSnackbar } from "notistack";
import {
  makeStyles,
  TextField,
  Button,
  MenuItem,
  FormControl,
  FormHelperText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Icon,
  InputAdornment,
  Paper,
  Select,
  InputLabel,
  Chip,
  LinearProgress,
  Tooltip,
} from "@material-ui/core";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import { GridOverlay, DataGrid } from "@material-ui/data-grid";
import { Alert, Autocomplete } from "@material-ui/lab";
import { getAPI, postAPI } from "../../services";
import { getAuthenticatedUser } from "../../utils/authentication";
import { calculateAge } from "../../utils/commons";
import { GridContainer, GridItem } from "../../components/Grid";
import ControlledAccordions from "./patient_history";
import opdStyles from "./styles";
import { Check } from "@material-ui/icons";
import {
  HEIGHT,
  WEIGHT,
  BMI,
  SYSTOLIC,
  DIASTOLIC,
} from "../../utils/constants";
import './index.css';
import cardIconStyle from './../../components/Card/CardIcon/styles';


const useStyles = makeStyles(opdStyles);

const initialState = {
  [HEIGHT]: "",
  [WEIGHT]: "",
  [BMI]: "",
  [SYSTOLIC]: "",
  [DIASTOLIC]: "",
};

const CustomLoadingOverlay = () => {
  return (
    <GridOverlay>
      <div style={{ position: "absolute", top: 0, width: "100%" }}>
        <LinearProgress />
      </div>
    </GridOverlay>
  );
};

const CustomNoRowsOverlay = () => {
  return (
    <GridOverlay>
      <Alert severity="info">
        <strong>No records found.</strong>
      </Alert>
    </GridOverlay>
  );
};

const createPatientList = (results) => {
  const patientList = results.map((result) => {
    const { uuid, display, person } = result.patient;
    const encounters = result.encounters.filter(
      (encounter) => encounter.encounterType.display === "Vitals"
    );

    encounters.sort((a, b) =>
      moment(a.encounterDatetime) > moment(b.encounterDatetime)
        ? -1
        : moment(a.encounterDatetime) < moment(b.encounterDatetime)
        ? 1
        : 0
    );

    return {
      visit: result.uuid,
      encounter: encounters[0]?.uuid,
      uuid: uuid,
      id: display.split("-")[0],
      name: display.split("-")[1].trim(),
      gender: person.gender,
      visitTime: moment(result.startDatetime).format("hh:mm A"),
      location: result.location.display,
      age: calculateAge(person.birthdate),
      triage: (
        <Button
          variant="text"
          size="small"
          color="primary"
          endIcon={encounters[0]?.uuid && <Check />}
        >
          Vitals
        </Button>
      ),
      history: (
        <Button variant="text" color="primary">
          History
        </Button>
      ),
    };
  });

  return patientList;
};

const col = [
  { field: "visit", hide: true },
  { field: "encounter", hide: true },
  { field: "uuid", hide: true },
  { field: "id", headerName: "PatientID", width: 125 },
  {
    field: "name",
    headerName: "Name",
    width: 200,
  },
  { field: "gender", headerName: "Gender" },
  { field: "age", headerName: "Age", width: 125 },

  { field: "location", headerName: "Location", width: 150 },
  { field: "visitTime", headerName: "Time" },
  {
    field: "triage",
    headerName: "Triage",
    type: "string",
    renderCell: (params) => params.value,
  },

  {
    field: "history",
    headerName: "History",
    type: "string",
    renderCell: (params) => params.value,
  },
];

export default function Triage() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [filteredPatientList, setFilteredPatientList] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState([]);
  const [historyfields, setHistoryfields] = useState([]);
  const [showhistory, setShowhistory] = useState(false);
  const [isFemale, setIsFemale] = useState(false);
  const [patient, setPatient] = useState({});
  const [vitalValues, setVitalValues] = useState(initialState);
  const [historyValues, setHistoryValues] = useState({});
  const [previousVitals, setPreviousVitals] = useState([]);
  const [previousVitalsLoading, setPreviousVitalsLoading] = useState(false);
  const [providerUuid, setProviderUuid] = useState(null);
  const [vitalSaved, setVitalSaved] = useState(false);
  const [location, setLocation] = useState(null);
  const [searchKey, setSearchKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const locations = useSelector((state) => state.locations.locations);

  useEffect(() => {
    setLoading(true);
    const url =
      "/visit?includeInactive=false&v=custom:(uuid,patient:(uuid,display,person:(gender,age,birthdate)),visitType:(display),location:(display),startDatetime,encounters:(uuid,encounterDatetime,encounterType:(display),obs:(uuid,display)))";
    getAPI(url).then((response) => {
      const patientList = createPatientList(response.data.results);
      setPatientsList(patientList);
      setFilteredPatientList(patientList);
      setLoading(false);
    });
  }, [vitalSaved]);

  useEffect(() => {
    let url1 =
      "/concept?q=Vital Signs&v=custom:(answers:(uuid,display,datatype:(display),answers:(uuid,display),description:(display)))";
    getAPI(url1)
      .then((response) => {
        setFields(response.data.results[0].answers);
      })
      .catch((error) => console.log(error));

    getAPI(
      `/provider?q=${
        getAuthenticatedUser().display
      }&v=custom:(uuid,person:(uuid))`
    )
      .then((response) => {
        const { results } = response.data;
        const provider = results.filter(
          (result) => result.person.uuid === getAuthenticatedUser().person.uuid
        );
        provider.length && setProviderUuid(provider[0].uuid);
      })
      .catch((error) => {
        console.log(error);
      });

    let patient_history_url = `/concept?q=Patient History&v=custom:(answers:(display,answers:(uuid,display,datatype:(display),synonyms:(display),answers:(uuid,display,datatype:(display),answers:(uuid,display,datatype:(display),answers:(uuid,display,datatype:(display)))))`;
    getAPI(patient_history_url)
      .then((response) => {
        setHistoryfields(response.data.results[0].answers);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setVitalValues({ ...vitalValues, [name]: value });
  };

  const handleDateChange = (date, value) => {
    let edd = date.clone().add(7, "days").add(9, "months");
    setVitalValues({
      ...vitalValues,
      "1fea6d3a-8167-4039-b345-b28c347053e1": date,
      "c225630f-8a65-46a3-8848-f45716d7d45d": edd,
    });
  };

  const handleLocationChange = (event, value) => {
    setLoading(true);
    setLocation(value);
    setFilteredPatientList(getFilteredPatientList(value, searchKey));
    setLoading(false);
  };

  const searchOnKey = (event) => {
    const key = event.target.value;
    setLoading(true);
    setSearchKey(key);
    setFilteredPatientList(getFilteredPatientList(location, key.toLowerCase()));
    setLoading(false);
  };

  const getFilteredPatientList = (location, key) => {
    let filteredList = location
      ? patientsList.filter((patient) => patient.location === location.display)
      : patientsList;

    filteredList =
      key.length >= 3
        ? filteredList.filter(
            (patient) =>
              patient.name.toLowerCase().includes(key) ||
              patient.id.toLowerCase().includes(key)
          )
        : filteredList;

    return filteredList;
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    if (name === HEIGHT || name === WEIGHT) {
      const weight = vitalValues[WEIGHT];
      const height = vitalValues[HEIGHT] / 100;
      if (height && weight) {
        setVitalValues({
          ...vitalValues,
          [BMI]: (weight / (height * height)).toFixed(2),
        });
      }
    }

    if (name === SYSTOLIC || name === DIASTOLIC) {
      const systolic = vitalValues[SYSTOLIC];
      const diastolic = vitalValues[DIASTOLIC];
      if (systolic && diastolic) {
        systolic < diastolic
          ? setErrors({
              ...errors,
              [SYSTOLIC]: "Systolic cannot be less than diastolic.",
            })
          : setErrors({
              ...errors,
              [SYSTOLIC]: null,
            });
      }
    }
  };

  const handleOpen = (event) => {
    if (!providerUuid) return;
    const { row, field } = event;
    row.uuid !== patient.uuid && setVitalValues(initialState);
    setIsFemale(row.gender === "F");
    setPatient(row);
    setOpen(true);
    if (row.encounter) {
      setPreviousVitalsLoading(true);
      getAPI(
        `/encounter/${row.encounter}?v=custom:(obs:(display,concept:(uuid,datatype:(display)),value:(uuid,display)))`
      )
        .then((response) => {
          setPreviousVitals(response.data.obs);
          setPreviousVitalsLoading(false);
        })
        .catch((error) => {
          let message =
            error.message === "Network Error"
              ? "Please check you internet connection."
              : "There is some problem while making request. Please try again.";
          enqueueSnackbar(message);
        });
    }

    setVitalSaved(false);

    field === "history" ? setShowhistory(true) : setShowhistory(false);
  };

  const handleClose = () => {
    setPreviousVitals([]);
    setOpen(false);
  };

  const saveVitals = (event) => {
    event.preventDefault();
    const encounter = {
      encounterType: "67a71486-1a54-468f-ac3e-7091a9a79584",
      encounterProviders: [
        {
          provider: providerUuid,
          encounterRole: "240b26f9-dd88-4172-823d-4a8bfeb7841f",
        },
      ],
      patient: patient.uuid,
      visit: patient.visit,
      obs: getObs(),
    };

    postAPI("/encounter", encounter)
      .then((response) => {
        enqueueSnackbar("Vitals saved successfully.");
        setOpen(false);
        setVitalSaved(true);
      })
      .catch((error) => {
        console.log(error);
        enqueueSnackbar(
          "There is a problem while saving vitals. Please try again."
        );
      });
  };

  const savePatientHistory = (event) => {
    event.preventDefault();
    const encounter = {
      encounterType: "f4776859-673c-4f75-abb0-bcc0e9d037d2",
      encounterProviders: [
        {
          provider: providerUuid,
          encounterRole: "240b26f9-dd88-4172-823d-4a8bfeb7841f",
        },
      ],
      patient: patient.uuid,
      visit: patient.visit,
      obs: getHistoryObs(),
    };

    postAPI("/encounter", encounter)
      .then((response) => {
        enqueueSnackbar("Patient History saved successfully.");
        setOpen(false);
        setVitalSaved(true);
      })
      .catch((error) => {
        console.log(error);
        enqueueSnackbar(
          "There is a problem while saving history. Please try again."
        );
      });
  };

  const getHistoryObs = () => {
    let obs = [];
    for (const key in historyValues) {
      if (Object.hasOwnProperty.call(historyValues, key)) {
        const value = historyValues[key];
        obs.push({
          concept: key,
          value: typeof value !== "object" ? value : value.toISOString(),
        });
      }
    }
    return obs;
  };

  const handleHistoryChange = (event, hisConcept) => {
    const { name, value } = hisConcept;
    setHistoryValues({ ...historyValues, [name]: value });
  };

  const deleteHistoryChange = (event,hisConcept) => {
    for (const key in historyValues) {
      if (Object.hasOwnProperty.call(historyValues, key)) {
        if (hisConcept.includes(key)) {
          delete historyValues[key]
          setHistoryValues(historyValues)
        }
      }
    }
  };


  const getObs = () => {
    let obs = [];
    for (const key in vitalValues) {
      if (Object.hasOwnProperty.call(vitalValues, key)) {
        const value = vitalValues[key];
        obs.push({
          concept: key,
          value: typeof value !== "object" ? value : value.toISOString(),
        });
      }
    }
    return obs;
  };

  const getPreviousVitalValue = (uuid) => {
    let helperText = "No recent value";
    previousVitals.forEach((previousVital) => {
      const { concept, value } = previousVital;
      if (concept.uuid === uuid) {
        helperText = "Recent Value: ";
        helperText +=
          concept.datatype.display === "Coded"
            ? value.display
            : concept.datatype.display === "Date"
            ? moment(value).format("DD/MM/yyyy")
            : value;
      }
    });

    return helperText;
  };

  const getFeilds = () => {
    return (
      <>
        {fields.map((field, index) => {
          const { uuid, display, datatype, answers, description } = field;

          if (datatype.display === "Coded") {
            return (
              <GridItem item xs={12} sm={6} md={3} key={uuid}>
                <Tooltip
                  title={description?.display || display}
                  arrow
                  interactive
                  disableFocusListener
                  enterDelay={3000}
                >
                  <FormControl
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    size="small"
                  >
                    <InputLabel id={display}>{display}</InputLabel>
                    <Select
                      labelId={display}
                      id={uuid}
                      name={uuid}
                      value={vitalValues[uuid]}
                      onChange={handleChange}
                      label={display}
                      autoFocus={!index}
                    >
                      {answers.map((answer) => (
                        <MenuItem key={answer.uuid} value={answer.uuid}>
                          {answer.display}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {previousVitalsLoading
                        ? "loading..."
                        : getPreviousVitalValue(uuid)}
                    </FormHelperText>
                  </FormControl>
                </Tooltip>
              </GridItem>
            );
          }

          if (datatype.display === "Numeric") {
            return (
              <GridItem item xs={12} sm={6} md={3} key={uuid}>
                <Tooltip
                  title={description?.display || display}
                  arrow
                  interactive
                  disableFocusListener
                  enterDelay={3000}
                >
                  <TextField
                    variant="outlined"
                    id={uuid}
                    name={uuid}
                    label={display}
                    value={vitalValues[uuid]}
                    type="number"
                    size="small"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                    margin="normal"
                    autoFocus={!index}
                    disabled={display === "BMI"}
                    error={errors[uuid]}
                    helperText={
                      errors[uuid]
                        ? errors[uuid]
                        : previousVitalsLoading
                        ? "loading..."
                        : getPreviousVitalValue(uuid)
                    }
                  />
                </Tooltip>
              </GridItem>
            );
          }
          if (isFemale) {
            return (
              <GridItem item xs={12} sm={6} md={3} key={uuid}>
                <Tooltip
                  title={description?.display || display}
                  arrow
                  interactive
                  disableFocusListener
                  enterDelay={3000}
                >
                  <MuiPickersUtilsProvider utils={MomentUtils}>
                    <KeyboardDatePicker
                      fullWidth
                      size="small"
                      name={uuid}
                      margin="normal"
                      disableFuture={display === "LMP"}
                      disabled={display === "EDD"}
                      allowKeyboardControl
                      autoOk
                      inputVariant="outlined"
                      openTo="date"
                      format="DD/MM/yyyy"
                      label={display}
                      value={
                        display === "EDD" && !vitalValues[uuid]
                          ? moment().add(7, "days").add(9, "months")
                          : vitalValues[uuid]
                      }
                      autoFocus={!index}
                      onChange={handleDateChange}
                      helperText={
                        previousVitalsLoading
                          ? "loading..."
                          : getPreviousVitalValue(uuid)
                      }
                    />
                  </MuiPickersUtilsProvider>
                </Tooltip>
              </GridItem>
            );
          }
        })}
      </>
    );
  };

  return (
    <>
      {!providerUuid && (
        <Alert severity="info">
          <strong>This is not a provider account.</strong> You can not enter
          vitals. If you think this is a mistake, please contact your
          administrator.
        </Alert>
      )}
      <Paper>
        <GridContainer>
          <GridItem item xs={12} sm={6} md={9}>
            <TextField
              label="Search patient by name or ID"
              id="value"
              variant="outlined"
              size="small"
              margin="normal"
              fullWidth
              type="search"
              autoFocus
              onChange={searchOnKey}
              className="value"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Icon className="fas fa-search" />
                  </InputAdornment>
                ),
              }}
            />
          </GridItem>
          <GridItem item xs={12} sm={6} md={3}>
            <Autocomplete
              options={locations || []}
              getOptionLabel={(option) => option.display}
              onChange={handleLocationChange}
              value={location}
              defaultValue={location}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Department"
                  size="small"
                  margin="normal"
                  variant="outlined"
                />
              )}
            />
          </GridItem>
        </GridContainer>
        <DataGrid
          loading={loading}
          onCellClick={handleOpen}
          rows={filteredPatientList}
          disableColumnMenu
          columns={col}
          autoHeight
          rowHeight={40}
          headerHeight={40}
          pageSize={10}
          components={{
            LoadingOverlay: CustomLoadingOverlay,
            NoRowsOverlay: CustomNoRowsOverlay,
          }}
        />
      </Paper>
      <Dialog
        maxWidth="lg"
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        fullWidth
        className={showhistory && "patientDialog"}
      >
        {!showhistory && (
          <form
            onSubmit={saveVitals}
            onReset={(e) => setVitalValues(initialState)}
          >
            <DialogTitle id="form-dialog-title" disableTypography>
              <h3 style={{ margin: 0 }}>Vital Signs</h3>
              <Chip
                label={`${patient.name}, ${patient.age}, ${patient.gender}`}
              />
            </DialogTitle>
            <DialogContent dividers>
              <GridContainer>{getFeilds()}</GridContainer>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="secondary">
                Cancel
              </Button>
              <Button type="reset">Reset</Button>
              <Button type="submit" color="primary">
                Save
              </Button>
            </DialogActions>
          </form>
        )}
        {showhistory && (
          <div>
          <form
              onSubmit={savePatientHistory}

          >
            <DialogTitle id="form-dialog-title">Patient History</DialogTitle>
            <DialogContent dividers>
              <GridContainer>
                <ControlledAccordions
                  historyfields={historyfields}
                    onChange={handleHistoryChange}
                    onDelete={deleteHistoryChange}
                    savedValues = {historyValues}
                  key="Accordians"
                />
              </GridContainer>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Save
              </Button>
              </DialogActions>
              </form>
          </div>
        )}
      </Dialog>
    </>
  );
}
