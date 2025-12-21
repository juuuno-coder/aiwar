// 사운드 매니저

export type SoundType = 'bgm' | 'sfx';
export type BGMTrack = 'main' | 'battle' | 'shop' | 'victory';
export type SFXTrack = 'click' | 'win' | 'lose' | 'card-get' | 'level-up' | 'coin';

interface SoundSettings {
    bgmVolume: number; // 0-1
    sfxVolume: number; // 0-1
    bgmMuted: boolean;
    sfxMuted: boolean;
}

class SoundManager {
    private static instance: SoundManager;
    private bgmAudio: HTMLAudioElement | null = null;
    private sfxAudios: Map<SFXTrack, HTMLAudioElement> = new Map();
    private currentBGM: BGMTrack | null = null;
    private settings: SoundSettings = {
        bgmVolume: 0.5,
        sfxVolume: 0.7,
        bgmMuted: false,
        sfxMuted: false
    };
    private initialized = false;

    private constructor() {
        this.loadSettings();
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    /**
     * 사운드 시스템 초기화
     */
    public initialize(): void {
        if (this.initialized || typeof window === 'undefined') return;

        // BGM 오디오 객체 생성
        this.bgmAudio = new Audio();
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = this.settings.bgmMuted ? 0 : this.settings.bgmVolume;

        // SFX 오디오 객체 미리 생성
        const sfxTracks: SFXTrack[] = ['click', 'win', 'lose', 'card-get', 'level-up', 'coin'];
        sfxTracks.forEach(track => {
            const audio = new Audio();
            audio.volume = this.settings.sfxMuted ? 0 : this.settings.sfxVolume;
            this.sfxAudios.set(track, audio);
        });

        this.initialized = true;
    }

    /**
     * BGM 재생
     */
    public playBGM(track: BGMTrack): void {
        if (!this.initialized || !this.bgmAudio) return;

        // 이미 같은 BGM이 재생 중이면 무시
        if (this.currentBGM === track && !this.bgmAudio.paused) return;

        // BGM 파일 경로 (실제 파일이 없으므로 주석 처리)
        // const bgmPaths: Record<BGMTrack, string> = {
        //   main: '/sounds/bgm-main.mp3',
        //   battle: '/sounds/bgm-battle.mp3',
        //   shop: '/sounds/bgm-shop.mp3',
        //   victory: '/sounds/bgm-victory.mp3'
        // };

        // this.bgmAudio.src = bgmPaths[track];
        // this.bgmAudio.play().catch(err => console.log('BGM play failed:', err));
        this.currentBGM = track;
    }

    /**
     * BGM 정지
     */
    public stopBGM(): void {
        if (!this.bgmAudio) return;
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
        this.currentBGM = null;
    }

    /**
     * SFX 재생
     */
    public playSFX(track: SFXTrack): void {
        if (!this.initialized) return;

        const audio = this.sfxAudios.get(track);
        if (!audio) return;

        // SFX 파일 경로 (실제 파일이 없으므로 주석 처리)
        // const sfxPaths: Record<SFXTrack, string> = {
        //   click: '/sounds/sfx-click.mp3',
        //   win: '/sounds/sfx-win.mp3',
        //   lose: '/sounds/sfx-lose.mp3',
        //   'card-get': '/sounds/sfx-card-get.mp3',
        //   'level-up': '/sounds/sfx-level-up.mp3',
        //   coin: '/sounds/sfx-coin.mp3'
        // };

        // audio.src = sfxPaths[track];
        // audio.currentTime = 0;
        // audio.play().catch(err => console.log('SFX play failed:', err));
    }

    /**
     * BGM 볼륨 설정
     */
    public setBGMVolume(volume: number): void {
        this.settings.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgmAudio && !this.settings.bgmMuted) {
            this.bgmAudio.volume = this.settings.bgmVolume;
        }
        this.saveSettings();
    }

    /**
     * SFX 볼륨 설정
     */
    public setSFXVolume(volume: number): void {
        this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
        if (!this.settings.sfxMuted) {
            this.sfxAudios.forEach(audio => {
                audio.volume = this.settings.sfxVolume;
            });
        }
        this.saveSettings();
    }

    /**
     * BGM 음소거 토글
     */
    public toggleBGMMute(): boolean {
        this.settings.bgmMuted = !this.settings.bgmMuted;
        if (this.bgmAudio) {
            this.bgmAudio.volume = this.settings.bgmMuted ? 0 : this.settings.bgmVolume;
        }
        this.saveSettings();
        return this.settings.bgmMuted;
    }

    /**
     * SFX 음소거 토글
     */
    public toggleSFXMute(): boolean {
        this.settings.sfxMuted = !this.settings.sfxMuted;
        const volume = this.settings.sfxMuted ? 0 : this.settings.sfxVolume;
        this.sfxAudios.forEach(audio => {
            audio.volume = volume;
        });
        this.saveSettings();
        return this.settings.sfxMuted;
    }

    /**
     * 설정 가져오기
     */
    public getSettings(): SoundSettings {
        return { ...this.settings };
    }

    /**
     * 설정 저장
     */
    private saveSettings(): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem('sound-settings', JSON.stringify(this.settings));
    }

    /**
     * 설정 로드
     */
    private loadSettings(): void {
        if (typeof window === 'undefined') return;
        const data = localStorage.getItem('sound-settings');
        if (data) {
            this.settings = { ...this.settings, ...JSON.parse(data) };
        }
    }
}

// 싱글톤 인스턴스 export
export const soundManager = SoundManager.getInstance();

// 편의 함수들
export const playBGM = (track: BGMTrack) => soundManager.playBGM(track);
export const stopBGM = () => soundManager.stopBGM();
export const playSFX = (track: SFXTrack) => soundManager.playSFX(track);
export const setBGMVolume = (volume: number) => soundManager.setBGMVolume(volume);
export const setSFXVolume = (volume: number) => soundManager.setSFXVolume(volume);
export const toggleBGMMute = () => soundManager.toggleBGMMute();
export const toggleSFXMute = () => soundManager.toggleSFXMute();
export const getSoundSettings = () => soundManager.getSettings();
export const initializeSound = () => soundManager.initialize();
