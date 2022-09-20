import React, {useEffect, useMemo, useState} from 'react';
import {usePagination, useTable} from 'react-table'
import ReactTooltip from 'react-tooltip';
import {Route, Switch, useParams, useRouteMatch} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faAngleLeft, faAngleRight, faLaptop, faQuestionCircle} from '@fortawesome/free-solid-svg-icons'
import {Helmet} from 'react-helmet'
import {useDispatch, useSelector} from 'react-redux';
import {fetchEventPageData} from '../store';
import {CSVLink} from "react-csv";
import {getEnsData} from './../store/mutations';
import _ from 'lodash'

const GRAPH_LIMIT = 1000;

export default function Events() {
  let match = useRouteMatch();

  return (
    <Switch>
      <Route path={`${match.path}/:eventId`}>
        <Event />
      </Route>
      <Route path={match.path}>
        <h3>No event Selected</h3>
      </Route>
    </Switch>
  );
}

export function Event() {
  const params = useParams();
  const { eventId } = params;
  const dispatch = useDispatch()
  const tokens = useSelector(state => state.events.tokens)
  const loadingEvent  = useSelector(state => state.events.eventStatus)
  const errorEvent = useSelector(state => state.events.eventError)
  const event = useSelector(state => state.events.event)

  const [pageIndex, setPageIndex] = useState(0);
  const [data, setData] = useState([]);
  const [csv_data, setCsv_data] = useState([]);
  const [ensNames, setEnsNames] = useState([]);
  const pageCount = useMemo( () => event.tokenCount % 50 !== 0 ? Math.floor(event.tokenCount / 50) + 1 : event.tokenCount, [event])
  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventPageData({ eventId, first: GRAPH_LIMIT, skip: GRAPH_LIMIT*pageIndex  }))
    }
  }, [dispatch, eventId, pageIndex])

  useEffect(() => {
    let ownerIds = tokens.map(t => t.owner.id)
    if (event && event.tokenCount > GRAPH_LIMIT && tokens && tokens.length > 0) {
      const totalPages = Math.ceil(event.tokenCount / GRAPH_LIMIT);
      if (pageIndex + 1 < totalPages) {
        setPageIndex(pageIndex + 1);
      }
    }

    let _data = []
    let _csv_data = []
    _csv_data.push(['ID', 'Owner', 'ENS', 'Claim Date', 'Tx Count', 'Power']);
    for (let i = 0; i < tokens.length; i++) {
      const displayName = `${tokens[i].owner.id.substr(0,10)}…${tokens[i].ens ? tokens[i].ens : tokens[i].owner.id.substr(32)}`
      _data.push({
        col1:  (<a href={"https://app.poap.xyz/token/" + tokens[i].id} target="_blank" rel="noopener noreferrer">{tokens[i].id}</a>) ,
        col2: (<a href={"https://app.poap.xyz/scan/" + tokens[i].owner.id} target="_blank" rel="noopener noreferrer"> {displayName}</a>),
        col3: new Date(tokens[i].created * 1000).toLocaleDateString(),
        col4: tokens[i].transferCount,
        col5: tokens[i].owner.tokensOwned,
      })
      _csv_data.push([tokens[i].id, tokens[i].owner.id, null, new Date(tokens[i].created * 1000).toLocaleDateString(), tokens[i].transferCount, tokens[i].owner.tokensOwned])
    }
    setData(_data)
    setCsv_data(_csv_data)
    getEnsData(ownerIds).then(allnames => {
      if(allnames.length > 0){
        setEnsNames(allnames)
      }
    })
  }, [event, tokens, pageIndex, setPageIndex]);

  useEffect(() => {
    if(ensNames.length > 0){
      // TODO: probably there is a better way to merge
      var _data = _.cloneDeep(data);
      var _csv_data = _.cloneDeep(csv_data);
      for (let i = 0; i < tokens.length; i++) {
        let validName = ensNames[i]
        if(validName){
          if(data[i]){
            _data[i].col2 = (<a href={"https://app.poap.xyz/scan/" + tokens[i].owner.id}> {validName}</a>)
            _csv_data[i][2] = validName
          }
        }
      }
      setData(_data)
      setCsv_data(_csv_data)
    }
  }, [ensNames]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const columns = useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'col1', // accessor is the "key" in the data
      },
      {
        Header: 'Owner',
        accessor: 'col2',
      },
      {
        Header: 'Claim Date',
        accessor: 'col3',
      },
      {
        Header: 'Tx Count',
        accessor: 'col4',
      },
      {
        Header: () => (<span>Power <FontAwesomeIcon icon={faQuestionCircle} data-tip="Total amount of POAPs held by this address" /> <ReactTooltip /></span>),
        accessor: 'col5',
      },
    ],
    []
  )


  if (loadingEvent === 'loading' || loadingEvent === 'idle') {
    return (
      <main id="site-main" role="main" className="app-content">
        <Helmet>
          <title>POAP Gallery - Event</title>
          <link rel="canonical" href={"https://poap.gallery/event/" + eventId}/>
          <meta property="og:url" content={"https://poap.gallery/event/" + eventId }></meta>
          <meta property="og:title" content="POAP Gallery - Event"></meta>
        </Helmet>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <div className="spinner">
            <div className="cube1"></div>
            <div className="cube2"></div>
          </div>
        </div>
      </main>
    )
  }

  if (errorEvent || Object.keys(event).length === 0) {
    return (
      <main id="site-main" role="main" className="app-content">
        <Helmet>
          <title>POAP Gallery - Event</title>
          <link rel="canonical" href={"https://poap.gallery/event/" + eventId}/>
          <meta property="og:url" content={"https://poap.gallery/event/" + eventId }></meta>
          <meta property="og:title" content="POAP Gallery - Event"></meta>
        </Helmet>
        <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'column', margin: '0 auto', textAlign: 'center'}}>
          <h2>{errorEvent || 'Token not found'}</h2>
          <div >
            <img alt="warning sign" style={{maxWidth: '30rem'}} src="/icons/warning.svg"></img>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main id="site-main" role="main" className="app-content">
      <Helmet>
        <title>POAP Gallery - Event</title>
        <link rel="canonical" href={"https://poap.gallery/event/" + eventId}/>
        <meta property="og:url" content={"https://poap.gallery/event/" + eventId }></meta>
        <meta property="og:title" content="POAP Gallery - Event"></meta>
      </Helmet>
      <div className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          alignContent: 'space-around',
          justifyContent: 'space-around',
        }}>
          <div style={{flex: '0 0 18rem', display: 'flex', flexDirection: "column", justifyContent: "center"}}>
            <div style={{display: 'flex', justifyContent: "space-between"}}>
              <a href={parseInt(eventId)-1} ><FontAwesomeIcon icon={faAngleLeft}> </FontAwesomeIcon> </a>
              <h4 style={{marginBottom: '0'}}> Event Id: {eventId} </h4>
              <a href={parseInt(eventId)+1} ><FontAwesomeIcon icon={faAngleRight}> </FontAwesomeIcon></a>
            </div>
            <div style={{minHeight: '200px', margin: '0 auto'}}>
              <TokenCard event={event} />
            </div>
          </div>
          <div style={{flex: '1 1 18rem', maxWidth: '500px', overflowWrap: 'anywhere'}}>
            {tokenDetails(event, csv_data)}
          </div>
        </div>
        <div style={{display: 'flex', justifyContent:'center',textAlign: 'center'}}>
          <div style={{maxWidth: '50rem'}}>{event.description}</div>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', overflow: 'auto'}}>
          <CSVLink
            filename={`${event.name}.csv`}
            target="_blank"
            className="btn"
            style={{
              fontSize: '0.9rem', width: 'fit-content', borderRadius: '10px',
              boxShadow: 'none', minHeight: 'fit-content', minWidth: 'auto',
              marginBottom: '0px'
            }}
            data={csv_data}
          >
            Download CSV
          </CSVLink>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', overflow: 'auto' }}>
          <CreateTable event={event} loading={loadingEvent !== 'succeeded'} columns={columns} data={data} pageCount={pageCount} ></CreateTable>
        </div>
      </div>
    </main>
  );
}

function CreateTable({loading, pageCount: pc, columns, data, event}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
  } = useTable({ columns, data, pageCount: pc, initialState: { pageIndex: 0 }, manualPagination: true }, usePagination)

  return (
    <div style={{width: '100%'}}>
      <table className="activityTable" style={{ width: '100%', border: 'none' }} {...getTableProps()}>
      <thead>
        {// Loop over the header rows
        headerGroups.map(headerGroup => (
          // Apply the header row props
          <tr {...headerGroup.getHeaderGroupProps()}>
            {// Loop over the headers in each row
            headerGroup.headers.map(column => (
              // Apply the header cell props
              <th {...column.getHeaderProps()}>
                {// Render the header
                column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      {/* Apply the table body props */}
      <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
          <tr>
            {loading ? (
              // Use our custom loading state to show a loading indicator
              <td colSpan="10000">Loading...</td>
            ) : (
              <td colSpan="10000">
                Showing {page.length} of {page.length}{' '}
                results
              </td>
            )}
          </tr>
        </tbody>
    </table>
   </div>
  )
}

function TokenCard({ event }) {
  return (
    <div
      style={{
        borderRadius: '.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem 0rem',
        width: '300px',
      }}
    >
      <div
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          overflow: 'hidden'
        }}
      >
        <img
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%'
          }}
          src={event.image_url}
          alt="POAP"
        />
      </div>
      <div>
        <h3
        title={event.name}
        className="h4"
        style={{
          fontSize: '1.15rem',
          textAlign: 'center',
          margin: '.8rem 0',
          overflowWrap: 'anywhere',
        }}
        >{event.name}</h3>
      </div>
      <div></div>
    </div>
  );
}

function tokenDetails(event, csv_data) {
  let array1 = [
    { value: event.city, key: 'City' },
    { value: event.country, key: 'Country' },
    { value: event.start_date, key: 'Start date' },
    { value: event.end_date, key: 'End date' },
    { value: event.event_url, key: 'Website', render: (value) => {
      try {
          let host = new URL(value).hostname;
          return (
              <a href={value} className="href" target="_blank" rel="noopener noreferrer">{host}</a>
          )
      } catch (e) {
          return <></>
      }

    }},
  ];
  if (Array.isArray(csv_data) && csv_data.length > 1) {
    array1.push({ value: csv_data.length - 1, key: 'Supply' });
    const power = csv_data.reduce((power, token, index) => {
      if(index === 0)
        return 0;
      return power + token[5]
    }, 0)
    array1.push({ value: power, key: 'Power' });
  }
  let array2 = [];

  for (let i = 0; i < array1.length; i++) {
    if(array1[0].value === ''){
      array1[0].value = <span> Virtual event  <FontAwesomeIcon icon={faLaptop}></FontAwesomeIcon> </span>
    }
    if(array1[1].value === array1[2].value){
      //array1.shift();
      array1[1].value = null;
      array1[2] = {value: event.end_date, key: 'Date'}
    } //todo: if 1 == 2 , it pushes the the table down
    if(array1[i].value){
      let e = (
        <div key={i} style={{ display: 'flex', padding: '0 1rem'}}>
          <h4 style={{ flex: '0 0 7rem'}}> {array1[i].key} </h4>
          <div style={{ flex: '1 1 8rem'}}> {array1[i].render ? array1[i].render(array1[i].value) : array1[i].value} </div>
        </div>
      );
      array2.push(e);
    }
  }
  return array2;
}


