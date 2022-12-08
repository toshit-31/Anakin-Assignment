import Head from 'next/head'
import {useState, useEffect} from "react"
import {Container, Box, TextField, Button, Pagination, CircularProgress} from "@mui/material"
import IssueItem from "../components/IssueItem"

export default function Home() {
  
  const auth_token = process.env.NEXT_PUBLIC_token;
  const search_base = "https://api.github.com/search/issues?q=is:issue repo:YetiForceCompany/YetiForceCRM";

  let [filterQuery, setFilterQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [baseURL, setBaseURL] = useState("");
  const [paginationURL, setPaginationURL] = useState({});
  const [currPage, setCurrPage] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [closedCount, setClosedCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [issues, setIssues] = useState([]);
  const [filtered, setFiltered] = useState(false);

  useEffect(function(){
    clearSearch();
  }, [])

  async function clearSearch(){
    document.getElementById("filter_inp").value=""
    let baseurl = await getIssuesFromAPI(null, true);
    setBaseURL(baseurl);
  } 

  function transformData(iss){
    return {
      id: iss.id,
      url: iss.html_url,
      number: iss.number,
      title: iss.title,
      labels: iss.labels,
      state: iss.state,
      comment_count: iss.comments,
      created_at: iss.created_at,
      user: {
        name: iss.user.login,
        url: iss.user.html_url,
        type: iss.user.type
      }
    }
  }

  function setNextAndPrevURLs(headerStr, checkForLast){
    let urls = {};
    headerStr.split(",").map( urlStr => {
      let [url, rel] = urlStr.split(";");
      let relValue = rel.trim().split("=")[1].replace(/["]/gi, "");
      let urlValue = url.trim().replace(/[<|>]/g, "");
      urls[relValue] = urlValue;
    })
    setPaginationURL(urls);
    if(checkForLast) {
      setCurrPage(1);
      setPageCount(parseInt(new URLSearchParams(new URL(urls.last).search).get("page")))
    }
    return urls[Object.keys(urls)[0]].split("?")[0]
  }

  function getIssuesFromAPI(url, checkForLast){
    setFiltered(false);
    url = !!url ? url : "https://api.github.com/repos/YetiForceCompany/YetiForceCRM/issues";
    return new Promise((res, rej) => {
      let xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "json"
      xhr.setRequestHeader("Authorization", "Bearer "+auth_token);
      xhr.onreadystatechange = async function(){
        if(this.readyState == 4){
          if(this.status == 200){
            let result = this.response.map(transformData);
            if(checkForLast){
              await getIssuesCount(search_base);
            }
            setIssues(result);
            let baseurl = setNextAndPrevURLs(this.getResponseHeader("Link"), checkForLast);
            setLoading(false);
            res(baseurl);
          } else {
            rej();
          }
        }
      }
      xhr.send();
      setLoading(true);
    })
  }

  function navigateTo(ev, page){
    setIssues([]);
    setCurrPage(page)
    if(filtered && filterQuery.length != 0){
      filter(encodeURI(baseURL+"&page="+page), false);
    } else {
      if(filtered){
        getIssuesFromAPI(null, true);
      } else {
        let url = baseURL+"?page="+page;
        getIssuesFromAPI(url, false);
      }
    }
  }

  async function getIssuesCount(baseq){
    let qurl = baseq+" is:closed"
    let res = await fetch(encodeURI(qurl), {headers: {"Authorization": "Bearer "+auth_token}})
    let data = await res.json();
    let closedCount = data.total_count;
    qurl = baseq+" is:open"
    res = await fetch(encodeURI(qurl), {headers: {"Authorization": "Bearer "+auth_token}})
    data = await res.json();
    setOpenCount(data.total_count);
    setClosedCount(closedCount);
  }

  function filter(url, firstCall){
      setFiltered(true);
      let xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "json";
      xhr.setRequestHeader("Authorization", "Bearer "+auth_token)
      xhr.onreadystatechange = async function(){
        if(this.readyState == 4){
          if(this.status == 200){
            let result = this.response.items.map(transformData);
            setIssues(result);
            if(firstCall) {
              setBaseURL(url);
              await getIssuesCount(url);
            }
            if(!this.getResponseHeader("Link")){
              setPaginationURL({});
              setPageCount(1);
            } else {
              setNextAndPrevURLs(this.getResponseHeader("Link"), firstCall);
            }
            setLoading(false)
          }
        }
      }
      xhr.send();
      setLoading(true);
  }

  function handleOnChange(ev){
    if(ev.keyCode == 13){
      if(!!ev.target.value){
        setFiltered(true);
        const url = search_base + " " + filterQuery;
        filter(url, true);
      } else {
        getIssuesFromAPI(null, true);
      }
    } else {
      setFilterQuery(ev.target.value);
    }
  }

  function handleClosedIssues(){
    setFilterQuery("is:closed");
    const url = (filtered ? baseURL : search_base) + " is:closed"
    filter(url, true);
  }

  function handleOpenIssues(){
    setFilterQuery("is:open");
    const url = (filtered ? baseURL : search_base) + " is:open"
    filter(url, true);
  }

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container sx={{my: 5}}>
        <Box sx={{display: "flex", justifyContent: "space-between"}}>
          <Box sx={{flexGrow: 1}}>
            <TextField
              id='filter_inp'
              label="Search all issues"
              size='small'
              fullWidth
              onKeyUp={handleOnChange}
            />
          </Box>
          <Button variant="outlined" size="small" color="success" sx={{mx:1}}  onClick={clearSearch}>clear</Button>
        </Box>
        <Container sx={{my: 2, border: "1px solid #ddd", borderRadius: "5px"}} style={{padding: 0}}>
          <Box sx={{bgcolor: "#ddd", display: "flex", justifyContent: "space-between", py: 1}}>
            <Box>
              <Button variant="text" size="small" color="success" sx={{mx:1}}  onClick={handleOpenIssues}><div className="dot open"></div>Open {openCount}</Button>
              <Button variant="text" size="small" color="warning" onClick={handleClosedIssues}><div className="dot closed" ></div>closed {closedCount}</Button>
            </Box>
          </Box>
          {loading ? <Box sx={{textAlign: "center", my: 5}}><CircularProgress size={40}/></Box> : (issues.length > 0 ? issues.map( (issue) => {
              return <IssueItem key={issue.id} data={issue} />
          }) : <Box sx={{textAlign: "center"}}><p>No Issues</p></Box>)}
        </Container>
        <Box sx={{width: "100%", display: "flex", justifyContent:"center"}}>
          <Pagination count={pageCount} page={currPage} onChange={navigateTo}></Pagination>
        </Box>
      </Container>
    </div>
  )
}
