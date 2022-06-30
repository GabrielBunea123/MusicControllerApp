import React, { Component } from 'react'
import { Button, Grid, Typography, TextField, FormHelperText, FormControl, Radio, RadioGroup, FormControlLabel, Alert, Collapse } from '@mui/material'
import { Link } from "react-router-dom";

export default class CreateRoomPage extends Component {
    static defaultProps = {//SET THIS VALUES LIKE THIS SO U CAN USE IT IN OTHER PAGES TOO
        votesToSkip: 2,
        guestCanPause: true,
        update: false,
        roomCode: null,
        updateCallback: () => { },
    }
    constructor(props) {
        super(props)
        this.state = {
            guestCanPause: this.props.guestCanPause,
            votesToSkip: this.props.votesToSkip,
            successMsg: "",
            errorMsg: "",
        }
        this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this)
        this.handleVotesChange = this.handleVotesChange.bind(this)
        this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this)
        this.renderCreateButtons = this.renderCreateButtons.bind(this)
        this.renderUpdateButtons = this.renderUpdateButtons.bind(this)
        this.handleUpdateButtonPressed = this.handleUpdateButtonPressed.bind(this)
    }

    handleVotesChange(e) {
        this.setState({
            votesToSkip: e.target.value
        })
    }
    handleGuestCanPauseChange(e) {
        this.setState({
            guestCanPause: e.target.value === 'true' ? true : false
        })
    }
    handleRoomButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": 'application/json' },
            body: JSON.stringify({
                votes_to_skip: this.state.votesToSkip,
                guest_can_pause: this.state.guestCanPause
            })
        }
        fetch('/api/create-room', requestOptions)
            .then((res) => res.json())
            .then((data) => {
                this.props.history.push('/room/' + data.code)
            })
    }

    renderCreateButtons() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Button onClick={this.handleRoomButtonPressed} color="secondary" variant="contained">Create a Room</Button>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button color="primary" variant="contained" to='/' component={Link}>Back</Button>
                </Grid>
            </Grid>
        )
    }
    renderUpdateButtons() {
        return (
            <Grid item xs={12} align="center">
                <Button onClick={this.handleUpdateButtonPressed} color="secondary" variant="contained">Update Room</Button>
            </Grid>
        )
    }

    handleUpdateButtonPressed() {
        const requestOptions = {
            method: "PATCH",
            headers: { "Content-Type": 'application/json' },
            body: JSON.stringify({
                votes_to_skip: this.state.votesToSkip,
                guest_can_pause: this.state.guestCanPause,
                code: this.props.roomCode
            })
        }
        fetch('/api/update-room', requestOptions)
            .then((res) => {
                if (res.ok) {
                    this.setState({
                        successMsg: "Room updated successfully"
                    })
                } else {
                    this.setState({
                        errorMsg: "Error updating room"
                    })
                }
                this.props.updateCallback()//UPDATE THE STATS ON THE ROOM PAGE
            })
    }

    render() {

        const title = this.props.update ? "Update Room" : "Create a Room"

        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Collapse in={this.state.errorMsg != "" || this.state.successMsg != ""}>
                        {this.state.successMsg != "" ? (<Alert severity="success">{this.state.successMsg}</Alert>) : (<Alert severity="error">{this.state.errorMsg}</Alert>)}
                    </Collapse>

                </Grid>
                <Grid item xs={12} align="center">
                    <Typography component="h4" variant="h4">
                        {title}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center" style={{padding:20}}>
                    <FormControl component="fieldset">
                        <FormHelperText>
                            <div align="center">
                                Guest control of playback state
                            </div>
                        </FormHelperText>
                        <RadioGroup defaultValue={this.props.guestCanPause.toString()} onChange={this.handleGuestCanPauseChange}>
                            <FormControlLabel
                                value='true'
                                control={<Radio color="primary"></Radio>}
                                label="Play/Pause"
                                labelPlacement='bottom'>
                            </FormControlLabel>

                            <FormControlLabel
                                value='false'
                                control={<Radio color="secondary"></Radio>}
                                label="No control"
                                labelPlacement='bottom'>
                            </FormControlLabel>
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} align="center">
                    <FormControl>
                        <TextField onChange={this.handleVotesChange} required="true" type='number' defaultValue={this.state.votesToSkip} inputProps={{ min: 1, style: { textAlign: 'center' } }} />
                        <FormHelperText>
                            <div align="center">
                                Votes required to skip song
                            </div>
                        </FormHelperText>
                    </FormControl>
                </Grid>
                {this.props.update ? this.renderUpdateButtons() : this.renderCreateButtons()}
            </Grid>

        )
    }
}