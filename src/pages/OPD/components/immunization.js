import React,{useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from "@material-ui/core/Typography";
import TextField from '@material-ui/core/TextField';



const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}


const createTableData = (uuid,
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


export default function Immunize(props) {
    const classes = useStyles();

const rowpros = props.rows
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
        createTableData(
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

const handleCellClick = (event,uuid,fieldType) => {
    if (fieldType == "date") {
        var dateVal = new Date(event.target.value);
        var cDVal = {
        "name": uuid,
        "value":dateVal,
        }
        props.onChange(event, cDVal);
    }
    if (fieldType == "comment") {
    let cVal = {
      "name": uuid,
      "value":event.target.value,
    }
    props.onChange(event,cVal)
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Eligibility</TableCell>
            <TableCell>Vaccines</TableCell>
            <TableCell >Date</TableCell>
            <TableCell >Comments</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {immuneData.map((row) => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.eligibility}
              </TableCell>
                  <TableCell >
                              {
              Object.entries(row.vaccines).map(([key, value], i) =>
                <Typography key={i} value={key}>{value}</Typography>
              )
            }
                  </TableCell>
                  <TableCell >
                      <TextField
            name = {row.uuidDate}
          label="Date"
            type="date"
            id="date"
          margin="dense"
          InputLabelProps={{
          shrink: true,
            }}
          onChange = {(e)=>handleCellClick(e,row.uuidDate,"date")}
          />
                      </TableCell>
                  <TableCell >

                                <TextField
          label="Comment"
          multiline={true}
          margin="dense"
          name="comments"
          InputLabelProps={{
          shrink: true,
          }}
          onChange={(e) => handleCellClick(e, row.uuidComment,"comment")}
          />
                      </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
