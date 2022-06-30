import React, { Component } from "react";


import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { LinearProgress } from "@mui/material";
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';

export default class MusicPlayer extends Component {
  constructor(props) {
    super(props);
  }

  pauseSong() {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/pause", requestOptions);
  }

  playSong() {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/play", requestOptions);
  }
  skipSong() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/skip", requestOptions)
  }

  render() {
    const songProgress = (this.props.time / this.props.duration) * 100;

    return (
      <Card sx={{ display: "flex", padding: 1, margin: 5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto' }}>
            <Typography component="div" variant="h5">
              {this.props.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div">
              {this.props.artist}
            </Typography>
          </CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
            <IconButton
              onClick={() => {
                this.props.is_playing ? this.pauseSong() : this.playSong();
              }}
            >
              {this.props.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton onClick={() => this.skipSong()}>
              <SkipNextIcon />
            </IconButton>
          </Box>
          <Typography variant="subtitle1" component="p" sx={{ padding: 3 }}>
            {this.props.votes}/{" "}{this.props.votes_required} votes to skip
          </Typography>
        </Box>
        <CardMedia
          component="img"
          sx={{ width: 151 }}
          image={this.props.image_url}
          alt="Live from space album cover"
        />
      </Card>

    );
  }
}