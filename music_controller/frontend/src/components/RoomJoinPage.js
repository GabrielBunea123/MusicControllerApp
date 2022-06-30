import React,{Component} from 'react'
import { TextField,Button,Grid,Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export default class RoomJoinPage extends Component {
    constructor(props){
        super(props)
        this.state={
            roomCode:"",
            error:""
        }
        this.handleTextFieldChange = this.handleTextFieldChange.bind(this)
        this.handleRoomJoinPressed = this.handleRoomJoinPressed.bind(this)
    }

    handleTextFieldChange(e){
        this.setState({
            roomCode:e.target.value
        })
    }
    handleRoomJoinPressed(){
        const requestOptions={
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                code:this.state.roomCode
            })
        }
        fetch('/api/join-room',requestOptions)
        .then((res)=>{
            if(res.ok){
                this.props.history.push("/room/"+this.state.roomCode)
            }else{
                this.setState({
                    error:'ROOM NOT FOUND'
                })
            }
        })
    }

    render(){
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align='center'>
                    <Typography variant='h4' component="h4">
                        Join a Room
                    </Typography>
                </Grid>
                <Grid item xs={12} align='center'>
                    <TextField
                    error={this.state.error}
                    label='Code'
                    placeholder='Enter a Room Code'
                    value={this.state.roomCode}
                    helperText={this.state.error}
                    variant='outlined'
                    onChange={this.handleTextFieldChange}
                    />

                </Grid>
                <Grid item xs={12} align='center'>
                    <Button onClick={this.handleRoomJoinPressed} variant='contained' color="secondary">Enter Room</Button>
                </Grid>
                <Grid item xs={12} align='center'>
                    <Button variant='contained' to='/' color="primary" component={Link}>Back</Button>
                </Grid>
            </Grid>
        )
    }
}