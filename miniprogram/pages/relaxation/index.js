// pages/relaxation/index.js
Page({
  data: {
    audioList: [
      {
        id: 1,
        title: '林间溪流',
        artist: '自然之声',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // 示例 URL
        coverImgUrl: '/images/relaxation_music_bg.jpg',
        isFavorite: false,
        isPlaying: false,
      },
      {
        id: 2,
        title: '夏夜虫鸣',
        artist: '自然之声',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // 示例 URL
        coverImgUrl: '/images/relaxation_music_bg.jpg',
        isFavorite: true,
        isPlaying: false,
      },
      {
        id: 3,
        title: '平静海浪',
        artist: '冥想引导',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', // 示例 URL
        coverImgUrl: '/images/relaxation_music_bg.jpg',
        isFavorite: false,
        isPlaying: false,
      },
      {
        id: 4,
        title: '清晨鸟语',
        artist: '自然之声',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', // 示例 URL
        coverImgUrl: '/images/relaxation_music_bg.jpg',
        isFavorite: false,
        isPlaying: false,
      }
    ],
    currentPlayingId: null,
  },

  onLoad(options) {
    this.audioCtx = wx.createInnerAudioContext();

    this.audioCtx.onPlay(() => {
      this.updatePlayingState(true);
    });

    this.audioCtx.onPause(() => {
      this.updatePlayingState(false);
    });

    this.audioCtx.onEnded(() => {
      this.updatePlayingState(false);
      this.setData({ currentPlayingId: null });
    });

    this.audioCtx.onStop(() => {
      this.updatePlayingState(false);
    });

    this.audioCtx.onError((res) => {
      console.error(res.errMsg);
      this.updatePlayingState(false);
      this.setData({ currentPlayingId: null });
      wx.showToast({
        title: '音频播放失败',
        icon: 'none'
      });
    });
  },

  updatePlayingState(isPlaying) {
    const { audioList, currentPlayingId } = this.data;
    const newAudioList = audioList.map(item => {
      if (item.id === currentPlayingId) {
        return { ...item, isPlaying };
      }
      return { ...item, isPlaying: false }; // Ensure others are marked as not playing
    });
    this.setData({ audioList: newAudioList });
  },

  playAudio(e) {
    const { id, src } = e.currentTarget.dataset;
    const { currentPlayingId } = this.data;

    if (currentPlayingId === id) {
      // Toggle play/pause for the current audio
      if (this.audioCtx.paused) {
        this.audioCtx.play();
      } else {
        this.audioCtx.pause();
      }
    } else {
      // Play a new audio
      this.audioCtx.stop();
      this.audioCtx.src = src;
      this.audioCtx.autoplay = true;
      this.setData({ currentPlayingId: id });
    }
  },

  toggleFavorite(e) {
    const { id } = e.currentTarget.dataset;
    const { audioList } = this.data;
    const newAudioList = audioList.map(item => {
      if (item.id === id) {
        return { ...item, isFavorite: !item.isFavorite };
      }
      return item;
    });
    this.setData({ audioList: newAudioList });

    const currentItem = newAudioList.find(item => item.id === id);
    wx.showToast({
      title: currentItem.isFavorite ? '已收藏' : '取消收藏',
      icon: 'none',
      duration: 1000
    });
  },

  onUnload() {
    if (this.audioCtx) {
      this.audioCtx.destroy();
    }
  }
})
