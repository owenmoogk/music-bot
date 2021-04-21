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
			<Grid align='center' container spacing={1}>
				<Grid item xs={12}>
					<Typography component='h4' variant='h4'>
						What is House Party?
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Typography component='p' variant='h6'>
						House Party is an application that, using the Spotify API, allows a group to control music playback, with
						functionality for voting to skip songs, hosting multiple rooms, and pausing and playing songs. The host can control
						the permissions of the users on the 'Host Settings' page, so it will fit whatever needs you desire. Enjoy!
					</Typography>
				</Grid>
			</Grid>
		)
	}

	function createInfo(){
		return(
			<Grid align='center' container spacing={1}>
				<Grid item xs={12}>
					<Typography component='h4' variant='h4'>
						Why this app?
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Typography component='p' variant='h6'>
						I was bored during quarentine, and had just started with django. I had no idea how to integrate django with react, and learned an absolute butt-ton doing this. I used a tech with tim series as a guideline, and it went great :)
					</Typography>
				</Grid>
			</Grid>
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