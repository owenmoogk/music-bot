import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
	Button, 
	Grid, 
	Typography, 
	TextField, 
	FormControl,
	FormHelperText,
	FormControlLabel,
	RadioGroup,
	Radio
} from '@material-ui/core'

export default class CreateRoomPage extends Component {
	defaultVotes = 2;

	constructor(props) {
		super(props);
		this.state = {
			guestCanPause: true,
			votesToSkip: this.defaultVotes,
		}

		// binding the class to the function, so we can use 'this' to reference the class
		this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this)
		this.handleVotesChanged = this.handleVotesChanged.bind(this)
		this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this)
	}

	handleVotesChanged(object){
		this.setState({
			votesToSkip: object.target.value,
		})
	}

	handleGuestCanPauseChange(object){
		this.setState({
			guestCanPause: object.target.value === 'true' ? true:false
		})
	}

	handleRoomButtonPressed() {
		const requestOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				votes_to_skip: this.state.votesToSkip,
				guest_can_pause: this.state.guestCanPause,
			}),
		};
		fetch("/api/create-room", requestOptions)
			.then((response) => response.json())
			.then((data) => 
				// this.props.history is react router
				this.props.history.push('/room/' + data.code)
			);
	}

	render() {
		return (
			// 1 means 8 px, multiply by 8
			<Grid container spacing={1}>

				<Grid item xs = {12} align='center'>
					<Typography component='h4' variant='h4'>
						Create a room
					</Typography>
				</Grid>

				<Grid item xs = {12} align='center'>
					<FormControl component = 'fieldset'>
						<FormHelperText>
							<div align='center'>Guest Control of playback state</div>
						</FormHelperText>
						<RadioGroup row defaultValue='true' onChange={this.handleGuestCanPauseChange}>
							<FormControlLabel 
								value='true'
								control={<Radio color='primary' />}
								label='Play/Pause'
								labelPlacement='bottom'
							/>
							<FormControlLabel 
								value='false'
								control={<Radio color='secondary' />}
								label='No Control'
								labelPlacement='bottom'
							/>
						</RadioGroup>
					</FormControl>
				</Grid>


				<Grid item xs={12} align='center'>
					<FormControl>
						<TextField
							onChange={this.handleVotesChanged} 
							required={true}
							type='number'
							defaultValue = {this.defaultVotes}
							inputProps = {{
								min:1,
								style:{textAlign:"center"}
							}}
						/>
						<FormHelperText>
							<div align='center'>
								Votes Required to Skip
							</div>
						</FormHelperText>
					</FormControl>
				</Grid>

				<Grid item xs={12} align='center'>
					<Button color='secondary' variant='contained' onClick={this.handleRoomButtonPressed}>
						Create Room!
					</Button>
				</Grid>
				
				<Grid item xs={12} align='center'>
					<Button color='primary' variant='contained' to='/' component={Link}>
						Back
					</Button>
				</Grid>

			</Grid>
		)
	}
}	