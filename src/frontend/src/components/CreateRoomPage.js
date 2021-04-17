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
	Radio,
	Collapse
} from '@material-ui/core'
import {Alert} from '@material-ui/lab'


export default class CreateRoomPage extends Component {
	static defaultProps = {
		votesToSkip: 2,
		guestCanPause: true,
		update: false,
		roomCode: null,
		updateCallback: () => {},
	}

	constructor(props) {
		super(props);
		this.state = {
			guestCanPause: this.props.guestCanPause,
			votesToSkip: this.props.votesToSkip,
			errorMsg: '',
			successMsg: '',
		}

		// binding the class to the function, so we can use 'this' to reference the class
		this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this)
		this.handleVotesChanged = this.handleVotesChanged.bind(this)
		this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this)
		this.handleUpdateButtonPressed = this.handleUpdateButtonPressed.bind(this)
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

	handleUpdateButtonPressed(){
		const requestOptions = {
			method: "PATCH",
			headers: {"Content-Type": 'application/json'},
			body: JSON.stringify({
				votes_to_skip: this.state.votesToSkip,
				guest_can_pause: this.state.guestCanPause,
				code: this.props.roomCode,
			})
		}
		fetch('/api/update-room', requestOptions)
		.then((response) => {
			if (response.ok){
				this.setState({
					successMsg: "Room updated successfully!"
				})
			}
			else{
				this.setState({
					errorMsg: "Error updating room..."
				})
			}
			this.props.updateCallback()
		})
	}

	renderCreateButtons(){
		return(
			<Grid container spacing={1} align='center'>
				<Grid item xs={12}>
					<Button color='secondary' variant='contained' onClick={this.handleRoomButtonPressed}>
						Create Room!
					</Button>
				</Grid>
				
				<Grid item xs={12}>
					<Button color='primary' variant='contained' to='/' component={Link}>
						Back
					</Button>
				</Grid>
			</Grid>
		)
	}

	renderUpdateButtons(){
		return(
			<Grid item xs={12}>
				<Button 
					color='secondary' 
					variant='contained' 
					onClick={this.handleUpdateButtonPressed}
				>
					Update Room
				</Button>
			</Grid>
		)
	}

	render() {
		const title = this.props.update ? "Update Room": "Create New Room"
		return (
			// 1 means 8 px, multiply by 8
			<Grid container spacing={1}>

				<Grid item xs = {12} align='center'>
					<Collapse in={this.state.errorMsg != '' || this.state.successMsg != ""}>
						{this.state.successMsg != "" ? (<Alert severity='success' onClose={() => {this.setState({successMsg: ""})}}>{this.state.successMsg}</Alert>) : (<Alert severity='error' onClose={() => {this.setState({errorMsg: ""})}}>{this.state.errorMsg}</Alert>)}
					</Collapse>
				</Grid>

				<Grid item xs = {12} align='center'>
					<Typography component='h4' variant='h4'>
						{title}
					</Typography>
				</Grid>

				<Grid item xs = {12} align='center'>
					<FormControl component = 'fieldset'>
						<FormHelperText>
							<div align='center'>Guest Control of playback state</div>
						</FormHelperText>
						<RadioGroup row defaultValue={this.props.guestCanPause.toString()} onChange={this.handleGuestCanPauseChange}>
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
							defaultValue = {this.state.votesToSkip}
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
				{this.props.update ? this.renderUpdateButtons() : this.renderCreateButtons()}
			</Grid>
		)
	}
}	