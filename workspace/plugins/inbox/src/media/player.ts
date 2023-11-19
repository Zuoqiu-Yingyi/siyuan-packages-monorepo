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

export interface IPlayingOptions {
    element: HTMLVideoElement | HTMLAudioElement;
    media: {
        video: boolean,
        audio: boolean,
    };
};

export interface IPlayerConfiguration {
    options: IPlayingOptions;
    ws: WebSocket | URL;
};

export class Player {
    protected _options: IPlayingOptions;
    protected _objectURL!: string;
    protected _mediaSource!: MediaSource;
    protected _sourceBuffer!: SourceBuffer;
    protected _ws: WebSocket;
    protected _playing: boolean = false;
    protected _started: boolean = false;

    constructor(configuration: IPlayerConfiguration) {
        this._options = configuration.options;
        this._ws = configuration.ws instanceof WebSocket
            ? configuration.ws
            : new WebSocket(configuration.ws);
    }

    public async init(): Promise<void> {
        /**
         * REF: https://developer.mozilla.org/zh-CN/docs/Web/API/MediaSource/MediaSource
         */
        this._mediaSource = new MediaSource();
        this._objectURL = URL.createObjectURL(this._mediaSource);
        this._options.element.src = this._objectURL;
        this._sourceBuffer = await new Promise((resolve, reject) => {
            const getSourceBuffer = () => {
                try {
                    const mime = ((this._options.media.video && this._options.media.audio)
                        ? `video/webm; codecs="vp9,opus"`
                        : (this._options.media.video
                            ? `video/webm; codecs="vp9"`
                            : (this._options.media.audio
                                ? `audio/webm; codecs="opus"`
                                : ""
                            )
                        )
                    );
                    /**
                     * REF: https://developer.mozilla.org/zh-CN/docs/Web/API/MediaSource/addSourceBuffer
                     */
                    const sourceBuffer = this._mediaSource.addSourceBuffer(mime);
                    resolve(sourceBuffer);
                } catch (e) {
                    reject(e);
                }
            };

            if (this._mediaSource.readyState === "open") {
                getSourceBuffer();
            } else {
                this._mediaSource.addEventListener("sourceopen", getSourceBuffer);
            }
            this._mediaSource.addEventListener("sourceended", this.sourceendedEventHandler);
            this._mediaSource.addEventListener("sourceclose", this.sourcecloseEventHandler);
        });
    }


    public start(): boolean {
        if (this._started) {
            return false;
        }
        else {
            this._started = true;
            this._ws.addEventListener("message", this.messageEventHandler);
            this._ws.addEventListener("close", this.errorEventHandler)
            this._ws.addEventListener("error", this.closeEventHandler)
            return true;
        }
    }

    public stop(): boolean {
        if (this._started) {
            this._started = false;
            this._ws.removeEventListener("message", this.messageEventHandler);
            return true;
        }
        else {
            return false;
        }
    }

    public async play(): Promise<void> {
        this._playing = true;
        return this._options.element.play();
    }

    public pause(): void {
        this._playing = false;
        this._options.element.pause();
    }

    public close(code?: number, reason?: string): void {
        this._ws.close(code, reason);
    }

    protected readonly messageEventHandler = async (e: MessageEvent<Blob>) => {
        const buffer = await e.data.arrayBuffer();
        this._sourceBuffer.appendBuffer(buffer);
        if (this._playing) {
            await this._options.element.play();
        }
    }

    protected readonly errorEventHandler = async (e: Event) => {
        this._mediaSource.endOfStream("network");
    }

    protected readonly closeEventHandler = async (e: Event) => {
        this._mediaSource.endOfStream("network");
    }

    protected readonly sourceendedEventHandler = async (e: Event) => {
    }

    protected readonly sourcecloseEventHandler = async (e: Event) => {
    }
}
