import React, {useState, useEffect} from 'react';
import { Grid, Button, Typography, IconButton} from '@material-ui/core';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import {Link} from 'react-router-dom'

// learning functional components and hooks :)

const pages = {
	JOIN: 'pages.join',
	CREATE: 'pages.create',
}

export default function Info(props){

	// methods
	function joinInfo(){
		return(
			'Join page'
		)
	}

	function createInfo(){
		return(
			'Create page'
		)
	}

	// mounting and unmounting
	// kinda confusing lol
	useEffect(() => {
		// component mounted
		console.log("mounted")

		// component unmounted
		return () => console.log('cleanup')
	})

	// first param is name of 'container', second param is function used to modify this state 'container'
	const [page, setPage] = useState(pages.JOIN)

	return(
		<Grid container spacing={1}>
			<Grid item xs={12} align='center'>
				<Typography component='h4' variant='h4'>
					What is House Party?
				</Typography>
			</Grid>
			<Grid item xs={12} align='center'>
				<Typography component='h4' variant='h4'>
					{ page === pages.JOIN ? joinInfo():createInfo()}
				</Typography>
			</Grid>
			<Grid item xs={12} align='center'>
				<IconButton onClick = {() => {
					page === pages.CREATE ? setPage(pages.JOIN) : setPage(pages.CREATE);
				}}>
					{page === pages.CREATE ? <NavigateBeforeIcon/> : <NavigateNextIcon/>}
				</IconButton>
			</Grid>
			<Grid item xs={12} align='center'>
				<Button color='secondary' variant='contained' to='/' component={Link}>
					Back
				</Button>
			</Grid>
		</Grid>
	)
}