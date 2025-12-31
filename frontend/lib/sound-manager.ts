export type SoundType = 'bgm' | 'sfx';

class SoundManager {
    private static instance: SoundManager;
    private audioContext: AudioContext | null = null;
    private bgmAudio: HTMLAudioElement | null = null;
    private isMuted: boolean = false;
    private volume: number = 0.5;

    private constructor() {
        if (typeof window !== 'undefined') {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    public setMute(mute: boolean) {
        this.isMuted = mute;
        if (this.bgmAudio) {
            this.bgmAudio.muted = mute;
        }
    }

    public setVolume(vol: number) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.bgmAudio) {
            this.bgmAudio.volume = this.volume;
        }
    }

    public playBGM(url: string) {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
        }

        this.bgmAudio = new Audio(url);
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = this.volume;
        this.bgmAudio.muted = this.isMuted;

        this.bgmAudio.play().catch(e => {
            console.warn('BGM play failed (autoplay policy?):', e);
        });
    }

    public stopBGM() {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio.currentTime = 0;
            this.bgmAudio = null;
        }
    }

    public playSFX(url: string, fallbackType?: 'click' | 'attack' | 'success' | 'error') {
        if (this.isMuted) return;

        const audio = new Audio(url);
        audio.volume = this.volume;

        audio.play().catch(() => {
            // File not found or playback error -> Fallback to synth
            if (fallbackType) {
                this.playSynthSound(fallbackType);
            }
        });
    }

    // Web Audio API Synth Fallback
    private playSynthSound(type: 'click' | 'attack' | 'success' | 'error') {
        if (!this.audioContext) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;

        switch (type) {
            case 'click':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                gainNode.gain.setValueAtTime(0.1 * this.volume, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
            case 'attack':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.2);
                gainNode.gain.setValueAtTime(0.2 * this.volume, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;
            case 'success':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(440, now); // A4
                oscillator.frequency.setValueAtTime(554, now + 0.1); // C#5
                oscillator.frequency.setValueAtTime(659, now + 0.2); // E5
                gainNode.gain.setValueAtTime(0.1 * this.volume, now);
                gainNode.gain.linearRampToValueAtTime(0.1 * this.volume, now + 0.3);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                oscillator.start(now);
                oscillator.stop(now + 0.6);
                break;
            case 'error':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(100, now);
                oscillator.frequency.linearRampToValueAtTime(80, now + 0.3);
                gainNode.gain.setValueAtTime(0.2 * this.volume, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
        }
    }
}

export default SoundManager;
