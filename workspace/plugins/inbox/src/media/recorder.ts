/**
 * Copyright (C) 2023 Zuoqiu Yingyi
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { RecordRTCPromisesHandler } from "recordrtc";
import type { IMediaStreamConstraints } from ".";

export interface IRecordingOptions {
    timeSlice?: number;
    media: IMediaStreamConstraints;
};

export interface IRecorderConfiguration {
    recordingOptions: IRecordingOptions;
    ws: WebSocket | URL;
};

export class Recorder {
    protected _ws: WebSocket;
    protected _recorder!: RecordRTCPromisesHandler;
    protected _recordingOptions: IRecordingOptions;

    constructor(configuration: IRecorderConfiguration) {
        this._ws = configuration.ws instanceof WebSocket
            ? configuration.ws
            : new WebSocket(configuration.ws);
        this._recordingOptions = configuration.recordingOptions;
    }

    public async init(): Promise<void> {
        const stream = await navigator.mediaDevices.getUserMedia(
            this._recordingOptions.media
        );
        const type = this._recordingOptions.media.video ? "video" : "audio";
        /**
         * REF: {@link https://www.npmjs.com/package/recordrtc#codecs-support RecordRTC Codecs Support}
         * 
         * REF: {@link https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Video_codecs 网页视频编码指南 - Web 媒体技术 | MDN}
         * 
         * | 媒体格式                         | Firefox (`119.0.1`) | Chromium (`118.0.5993.138`) |
         * | :------------------------------- | :-----------------: | :-------------------------: |
         * | + `video/mp4`                    |         `✖`        |             `✖`            |
         * | - `video/mp4;codecs=vp8`         |         `✔`        |             `✖`            |
         * | - `video/mp4;codecs=vp9`         |         `✔`        |             `✖`            |
         * | - `video/mp4;codecs=av1`         |         `✖`        |             `✖`            |
         * | - `video/mp4;codecs=h264`        |         `✖`        |             `✖`            |
         * | - `video/mp4;codecs=h265`        |         `✔`        |             `✖`            |
         * | + `video/webm;`                  |         `✔`        |             `✖`            |
         * | + `video/webm;codecs=vp8`        |         `✔`        |             `✔`            |
         * | + `video/webm;codecs=vp9`        |         `✔`        |             `✔`            |
         * | - `video/webm;codecs=av1`        |         `✔`        |             `✖`            |
         * | + `video/webm;codecs=h264`       |         `✖`        |             `✖`            |
         * | - `video/webm;codecs=h265`       |         `✖`        |             `✖`            |
         * | + `video/mpeg`                   |         `✖`        |             `✖`            |
         * | + `video/x-matroska;codecs=avc1` |         `✖`        |             `✖`            |
         * | + `audio/wav`                    |         `✖`        |             `✖`            |
         * | + `audio/ogg`                    |         `✖`        |             `✖`            |
         * | + `audio/webm`                   |         `✔`        |             `✖`            |
         * | - `audio/webm;codecs=opus`       |         `✔`        |             `✔`            |
         * | + `audio/webm;codecs=pcm`        |         `✖`        |             `✖`            |
         */
        const mimeType = this._recordingOptions.media.video
            ? "video/webm;codecs=vp9"
            : "audio/webm";
        this._recorder = new RecordRTCPromisesHandler(stream, {
            type,
            mimeType,
            timeSlice: this._recordingOptions.timeSlice || 1000,
            ondataavailable: (blob) => {
                this._ws.send(blob);
            },
        });
    }

    public async start() {
        return this._recorder.startRecording();
    }

    public async stop() {
        return this._recorder.stopRecording();
    }

    public async pause() {
        return this._recorder.pauseRecording();
    }

    public async resume() {
        return this._recorder.resumeRecording();
    }

    public async reset() {
        return this._recorder.reset();
    }

    public async destroy() {
        return this._recorder.destroy();
    }

    public close(code?: number, reason?: string) {
        this._ws.close(code, reason);
    }
}
