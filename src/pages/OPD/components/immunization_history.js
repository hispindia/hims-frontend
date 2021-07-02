import React, { useState } from 'react';
import axios from "axios";

import { DataGrid } from '@material-ui/data-grid';
import Typography from "@material-ui/core/Typography";
import Alert from '@material-ui/lab/Alert';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
}));


const createData = (uuid,
  uuidDate,
  uuidComment,
  eligibility,
  vaccines,
  dateCreated,
  comments,
  id
) => {
  return { uuid,uuidDate,uuidComment,eligibility, vaccines, dateCreated, comments, id };
};

export default function ImmunizationTable(props) {

  const rowpros = props.rows
  const patientData = props.patientData;
  const classes = useStyles();
  var savedValues = props.savedValues;

  var storedata = [];
  let id = 0;
  var elig = "";
  var uuidval = "";
  var uuidDate = "";
  var uuidComment = "";
  var date = "";

  Object.entries(rowpros.answers).map(([key, value]) => {

    elig = value.display
    uuidval = value.uuid

    var vaccine = ""
    var comment = ""
    var vac = {}

      Object.entries(value.answers).map(([key, values]) => {
        if (values.datatype.display == "N/A") {
            vac["vaccine_" + key] = values.display
        }
        if (values.datatype.display == "Date") {
            uuidDate = values.uuid
        }
        if (values.datatype.display == "Text") {
            uuidComment = values.uuid
        }
      })

    if (Object.entries(vac).length != 0) {
      storedata.push(
        createData(
          uuidval,
          uuidDate,
          uuidComment,
          elig,
          vac,
          date,
          comment,
          id
        )
      );
      id = id + 1
    }
  })
  var [immuneData, setImmuneData] = useState(storedata);
  var [successcheck, setSuccesscheck] = useState(false);

  const columns = [
        {
      field: 'uuid', headerName: 'UUID', hide:true
    },
            {
      field: 'uuidDate', headerName: 'UUIDDate', hide:true
    },
                    {
      field: 'uuidComment', headerName: 'UUIDComment', hide:true
    },
    {
      field: 'eligibility', headerName: 'Eligibility', width: 180,
      cellClassName: 'super-app-theme--cell',
      headerClassName:'super-app-theme--cell',
},
    {
      field: 'vaccines', headerName: 'Vaccines', width: 300,
      cellClassName: 'super-app-positive',
      headerClassName:'super-app-positive',

      renderCell: (params) => {
        return(
          <div>
            {
              Object.entries(params.value).map(([key, value], i) =>
                <Typography key={i} value={key}>{value}</Typography>
              )
            }
          </div>
        )
      }
    },
  {
    field: 'dateCreated',
    headerName: 'Date',
    type: 'date',
    width: 250,
    editable: true,
    valueFormatter: (params) => {
      var d = new Date(params.value);
      params.value = [('0' + d.getDate()).slice(-2),
                    ('0' + (d.getMonth() + 1)).slice(-2),
                    d.getFullYear(),
      ].join('/');
                      },
    renderCell: (params) => {
        return(
          <TextField
          label="Date"
            type="date"
            id="date"
          margin="dense"
          name="Date"
          InputLabelProps={{
          shrink: true,
            }}
          onChange = {(e)=>handleCellClick(e,params)}
          />
        )
      }
    },

  {
    field: 'comments',
    headerName: 'Comments',
    width: 450,
    editable: true,
    renderCell: (params) => {
        return(
          <TextField
          label="Comment"
          multiline={true}
          margin="dense"
          name="comments"
          InputLabelProps={{
          shrink: true,
          }}
          value = {savedValues[params.uuidComment]}
          onChange={(e) => handleCellClick(e, params)}
          />
        )
      }
  },
  ];



  const handleEditCellChangeCommitted = React.useCallback(
    ({ id, field, props }) => {
      if (field == 'comments') {
        let datavalue = props.value;
        immuneData.forEach(function (row, index) {
        if (row.id === id) {
          handleValue(row.uuidComment,datavalue)
        }
        });
      }
    },
    [],
  );

  const handleValue = (uuidId, value) => {
    let cVal = {
      "name": uuidId,
      "value":value,
    }
    props.onChange(cVal,cVal)

  }
  const handleCellClick = (event, param) => {
    console.log(" Comment Values :",param)
    var dateVal = new Date(event.target.value);
    var cDVal = {
      "name": param.row.uuidDate,
      "value":dateVal,
    }
    props.onChange(event, cDVal);
  };

  return (
    <div>
    <div style={{ height: 400, width: '100%' }} >
      <DataGrid rows={immuneData}
        columns={columns}
        rowHeight={150}
        onEditCellChangeCommitted={handleEditCellChangeCommitted}
        showColumnRightBorder={true}
        showCellRightBorder={true}
          // onCellClick={handleCellClick}
          hideFooterPagination={true}
          hideFooter={true}

      />
      </div>

      </div>

  );
}
