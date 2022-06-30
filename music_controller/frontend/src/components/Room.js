import React,{Component} from 'react'
import { Grid,Button,Typograpghy, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import CreateRoomPage from './CreateRoomPage'
import MusicPlayer from './MusicPlayer'

export default class Room extends Component {
    constructor(props){
        super(props)
        this.state={
            votesToSkip:2,
            guestCanPause:false,
            isHost:false,
            showSettings:false,
            spotifyAuthenticated:false,
            song:{}
        }
        this.roomCode= this.props.match.params.roomCode//access the code from url
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this)
        this.updateShowSettings = this.updateShowSettings.bind(this)
        this.renderSettingsButton = this.renderSettingsButton.bind(this)
        this.renderSettings = this.renderSettings.bind(this)
        this.getRoomDetails = this.getRoomDetails.bind(this)
        this.authenticateSpotify = this.authenticateSpotify.bind(this)
        this.getCurrentSong = this.getCurrentSong.bind(this)
        this.getRoomDetails()
        this.getCurrentSong()
    }

    componentDidMount(){
        this.interval = setInterval(this.getCurrentSong,1000)
    }
    componentWillUnmount(){
        clearInterval(this.interval)
    }

    authenticateSpotify(){
        fetch('/spotify/is-authenticated')
        .then((res)=>res.json())
        .then((data)=>{
            this.setState({
                spotifyAuthenticated:data.status
            })
            if(!data.status){
                fetch("/spotify/get-auth-url")
                .then((res)=>res.json())
                .then((data)=>{
                    window.location.replace(data.url)
                })
            }
        })
    }

    getCurrentSong(){
        fetch('/spotify/current-song')
        .then((res)=>{
            if(!res.ok){
                return {}
            }
            else{
                return res.json()
            }
        })
        .then((data)=>{
            this.setState({
                song:data//GET ALL THE DATA FROM THE BACKEND AND ASSIGN IT TO THE SONG OBJECT
            })
            // console.log(this.state.song)
        })
    }

    getRoomDetails(){
        fetch('/api/get-room'+'?code='+this.roomCode)
        .then((res)=>{
            if(!res.ok){
                this.props.leaveRoomCallback()
                this.props.history.push("/")//IF THE ROOM DOESN'T EXIST REDIRECT USER TO THE HOMEPAGE
            }
            return res.json()
        })
        .then((data)=>{
            this.setState({
                votesToSkip:data.votes_to_skip,
                guestCanPause:data.guest_can_pause,
                isHost:data.is_host,
            })//we are getting the sent data from the GetRoom functions in the api views files
            
            if(this.state.isHost){this.authenticateSpotify()}
        })
    }

    leaveButtonPressed(){
        const requestOptions = {
            method:"POST",
            headers:{'Content-Type':"application/json"},
        }
        fetch('/api/leave-room',requestOptions)
        .then((res)=>{
            this.props.leaveRoomCallback()
            this.props.history.push("/")
        })

    }
    updateShowSettings(value){
        this.setState({
            showSettings:value
        })
    }

    renderSettingsButton(){
        return(
            <Grid item xs = {12} align="center">
                <Button onClick={()=>this.updateShowSettings(true)} color="primary" variant="contained">Settings</Button>
            </Grid>
        )
    }

    renderSettings(){//IF THE SHOW SETTINGS IS TRUE THEN RENDER IT ELSE RENDER THE PAGE ROOM
        return(<Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <CreateRoomPage
                    update={true} 
                    votesToSkip={this.state.votesToSkip} 
                    guestCanPause={this.state.guestCanPause}
                    roomCode = {this.roomCode}
                    updateCallback={this.getRoomDetails}
                    />
            </Grid>
            <Grid item xs={12} align="center">
                <Button onClick={()=>this.updateShowSettings(false)} color="primary" variant='contained'>Close</Button>
            </Grid>
        </Grid>)
    }

    render(){
        if(this.state.showSettings){
            return this.renderSettings()
        }
        return (

            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography variant="h4" component="h4">
                        Code: {this.roomCode}
                    </Typography>
                </Grid>
                <div style={{margin:'auto',}}>
                    <MusicPlayer {...this.state.song}></MusicPlayer>
                </div>
                {this.state.isHost ? this.renderSettingsButton() :null}
                <Grid item xs = {12} align="center">
                    <Button onClick={this.leaveButtonPressed} color="secondary" variant="contained">Leave Room</Button>
                </Grid>
            </Grid>
        )
    }
}