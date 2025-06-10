import { gsap } from 'gsap';

export class VisualizationManager {
    private containerId: string;
    private canvas: HTMLCanvasElement | null;
    private gl: WebGLRenderingContext | null;
    private timeline: gsap.core.Timeline | null;
    private p5Instance: any;
    private state: {
        rotation: number;
        depth: number;
        zoom: number;
        chartData: any;
        isLoading: boolean;
    };
    private config: {
        chartSize: number;
        centerX: number;
        centerY: number;
        particleCount: number;
        loadingSpeed: number;
        starCount: number;
        nebulaCount: number;
        planetCount: number;
        maxStarDepth: number;
        minStarDepth: number;
        starFieldSpeed: number;
        starSize: {
            min: number;
            max: number;
        };
        rotationSpeed: number;
    };

    constructor(containerId: string) {
        if (!containerId) {
            throw new Error('Container ID is required');
        }
        this.containerId = containerId;
        this.canvas = null;
        this.gl = null;
        this.timeline = null;
        this.p5Instance = null;
        this.state = {
            rotation: 0,
            depth: 0,
            zoom: 1,
            chartData: null,
            isLoading: true
        };

        this.config = {
            chartSize: 600,
            centerX: 300,
            centerY: 300,
            particleCount: 100,
            loadingSpeed: 5,
            starCount: 2000,
            nebulaCount: 5,
            planetCount: 8,
            maxStarDepth: 1000,
            minStarDepth: -1000,
            starFieldSpeed: 0.5,
            starSize: {
                min: 1,
                max: 4
            },
            rotationSpeed: 0.001
        };
    }

    async initialize(): Promise<this> {
        const container = document.getElementById(this.containerId);
        if (!container) {
            throw new Error(`Container with id "${this.containerId}" not found`);
        }

        // Initialize p5.js
        const p5 = (window as any).p5;
        if (!p5) {
            throw new Error('p5.js is required but not loaded');
        }

        // Create p5 instance
        this.p5Instance = new p5((p: any) => {
            p.setup = () => {
                const canvas = p.createCanvas(this.config.chartSize, this.config.chartSize, p.WEBGL);
                canvas.parent(container);
                this.canvas = canvas.elt;
                if (this.canvas) {
                    this.gl = this.canvas.getContext('webgl');
                }
                this.initializeWebGL();
                this.setupScene(p);
            };
            p.draw = () => {
                this.render(p);
            };
            p.remove = () => {
                if (p.canvas) {
                    p.canvas.remove();
                }
            };
        }, container);

        // Initialize GSAP timeline
        this.timeline = gsap.timeline();
        await this.setupAnimations();

        return this;
    }

    private initializeWebGL(): void {
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }

        // Initialize WebGL settings
        this.gl.viewport(0, 0, this.canvas!.width, this.canvas!.height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }

    private async setupAnimations(): Promise<void> {
        // Setup GSAP animations
        this.timeline!
            .to(this.state, {
                rotation: 360,
                duration: 20,
                repeat: -1,
                ease: 'none'
            })
            .pause();
    }

    setChartData(data: any): void {
        this.state.chartData = data;
        this.state.isLoading = false;
    }

    updateDepth(delta: number): void {
        this.state.depth += delta * 0.1;
    }

    pauseAnimation(): void {
        if (this.timeline) {
            this.timeline.pause();
        }
    }

    resumeAnimation(): void {
        if (this.timeline) {
            this.timeline.play();
        }
    }

    setupScene(p: any): void {
        // Base setup - can be overridden by child classes
        p.background(0);
        p.noStroke();
    }

    render(p: any): void {
        // Base render - can be overridden by child classes
        if (this.state.chartData) {
            // Basic rendering logic
            p.clear();
            p.rotateY(this.state.rotation * p.PI / 180);
        }
    }

    cleanup(): void {
        if (this.timeline) {
            this.timeline.pause();
            if (this.timeline.kill) {
                this.timeline.kill();
            } else if (this.timeline.clear) {
                this.timeline.clear();
            }
            this.timeline = null;
        }

        if (this.p5Instance) {
            if (typeof this.p5Instance.remove === 'function') {
                this.p5Instance.remove();
            } else if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
            this.p5Instance = null;
            this.canvas = null;
            this.gl = null;
        }
    }

    destroy(): void {
        this.cleanup();
    }
}
