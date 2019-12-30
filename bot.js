

const prefix = "Aim!";

const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const GOOGLE_API_KEY = "AIzaSyDC1L_V32QN44YqSqMl0PfA7Q9NjUuf2UM";
const youtube = new Youtube(GOOGLE_API_KEY);
const Discord = require("discord.js");
const client = new Discord.Client();


const queue = new Map();

client.once('ready', () => {
    console.log('準備好!');
});

client.once('reconnecting', () => {
    console.log('重新載Ing~~');
});

client.once('disconnect', () => {
    console.log('退出Ed');
});

client.on('message', async message => {
    client.user.setGame('Created By Aim_老熊');
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.split(' ');
    const searchString = args.slice(1).join(' ');
    const url = args[1].replace(/<(.+)>/g, '$1');
    const serverQueue = queue.get(message.guild.id);


    if (message.content.startsWith(`${prefix}play`)) {
        const voiceChannel = message.member.voiceChannel;
        if (!voiceChannel) return message.channel.send('I\'m sorry but you need to be in a voice channel to play music!');
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) {
            return message.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');
        }
        if (!permissions.has('SPEAK')) {
            return message.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');
        }

        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
                await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line no-await-in-loop
            }
            return message.channel.send(`✅ Playlist: **${playlist.title}** has been added to the queue!`);
        } else {
            try {
                var video = await youtube.getVideo(url);
            } catch (error) {
                try {
                    var videos = await youtube.searchVideos(searchString, 10);
                    let index = 0;
                    message.channel.send(`
__**Song selection:**__
${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}
Please provide a value to select one of the search results ranging from 1-10.
					`);
                    // eslint-disable-next-line max-depth
                    try {
                        var response = await message.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
                            maxMatches: 1,
                            time: 10000,
                            errors: ['time']
                        });
                    } catch (err) {
                        console.error(err);
                        return msg.channel.send('No or invalid value entered, cancelling video selection.');
                    }
                    const videoIndex = parseInt(response.first().content);
                    var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
                } catch (err) {
                    console.error(err);
                    return message.channel.send('🆘 I could not obtain any search results.');
                }
            }

        }
    }



    else if (message.content.startsWith(`${prefix}skip`)) {
        skip(message, serverQueue);

    } else if (message.content.startsWith(`${prefix}stop`)) {
        stop(message, serverQueue);

    } else {
        message.channel.send('你需要打一個正確的指令')

    }

    async function execute(message, serverQueue) {
        const args = message.content.split(' ');

        const voiceChannel = message.member.voiceChannel;
        if (!voiceChannel) return message.channel.send('你需要在一個語音頻道去播放音樂');
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return message.channel.send('我需要權限去播放音樂跟加入該語音頻道');
        }
////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////
        const songInfo = ytdl.getInfo(args[1]);
        const song = {
            title: songInfo.title,
            url: songInfo.video_url,
        };

        if (!serverQueue) {
            const queueContruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 3,
                playing: true,
            };

            queue.set(message.guild.id, queueContruct);

            queueContruct.songs.push(song);

            try {
                var connection = voiceChannel.join();
                queueContruct.connection = connection;
                play(message.guild, queueContruct.songs[0]);
            } catch (err) {
                console.log(err);
                queue.delete(message.guild.id);
                return message.channel.send(err);

            }

        } else {
            serverQueue.songs.push(song);
            console.log(serverQueue.songs);
            return message.channel.send(`${song.title} 已加到歌單裏`);
        }


        function skip(message, serverQueue) {
            if (!message.member.voiceChannel) return message.channel.send('你需要在一個語音頻道去停止播放音樂');
            if (!serverQueue) return message.channel.send('現在沒歌曲給我跳過');
            serverQueue.connection.dispatcher.end();
        }

        function stop(message, serverQueue) {
            if (!message.member.voiceChannel) return message.channel.send('你需要在一個語音頻道去停止播放音樂');
            serverQueue.songs = [];
            serverQueue.connection.dispatcher.end();
        }

        function play(guild, song) {
        }


    }

            if (!song) {
                serverQueue.voiceChannel.leave();
                queue.delete(guild.id);
                return;
            }

            const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
                .on('end', () => {
                    console.log('音樂播放完畢');
                    serverQueue.songs.shift();
                    play(guild, serverQueue.songs[0]);
                })
                .on('error', error => {
                    console.error(error);
                })
        ;
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`🎶 Start playing: **${song.title}**`);
})

            client.login("NjUzMjAwOTk3MjYyMjk1MDQw.XgoTng.iQzkyYYQufO8CDFLtadzFCv0O34");


