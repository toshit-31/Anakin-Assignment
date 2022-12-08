import {useState, useEffect} from "react"
import {Container, Box, TextField, Select, ButtonGroup, Button, Grid, Avatar, Chip, Tooltip} from "@mui/material"
import { green } from "@mui/material/colors";

export default function Home(props) {

  const [loading, setLoading] = useState(false);
  const [paginationURL, setPaginationURL] = useState({});
  const [prevURL, setPrevURL] = useState("");
  const [issues, setIssues] = useState([]);
  const [filters, setFilters] = useState({})

  useEffect(function(){
    
  }, [])

  function getTimeString(timeStr){
    let time, unit;
    let cread = new Date(timeStr).getTime();
    let currd = new Date().getTime()
    let df = 86400000, hf = 3600000, mf = 6000;
    let td = (currd - cread);
    if(td/df > 1){
        time = Math.ceil(td/df), unit = "days ago";
        if(td/df > 30){
            let d = new Date(cread)
            time = "on " + d.toLocaleDateString('default', {month: "short"}) + " " + d.getDate()
            unit = "";
        }
    } else if(td/hf > 1){
        time = Math.ceil(td/hf), unit = "hours ago";
    } else if (td/mf > 1){
        time = Math.ceil(td/mf), unit = "minutes ago";
    } else {
        time = Math.ceil(td), unit = "seconds ago";
    }
    return time+" "+unit;
  }

  
  return (
    <Box className="iss-item" >
        <Box>
            <div className={"dot "+props.data.state}></div>
            <span sx={{mx: 3}}>
                <a href={props.data.url}>{props.data.title}</a>
                <span sx={{mx: 3}}>
                {props.data.labels.map( label => {
                    return <Tooltip key={label.name} title={label.description}><Chip label={label.name} size="small" sx={{mx: 1, bgcolor: "#"+label.color+"33"}} variant="outlined"></Chip></Tooltip>
                })}
                </span>
            </span>
        </Box>
        <Box sx={{mx: 4}} className='subt'>#{props.data.number} opened {getTimeString(props.data.created_at)} by <a href={props.data.user.url}>{props.data.user.name}</a></Box>
    </Box>
  )
}
