import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedBackground = ({ theme = 'dark' }) => {
  const canvasRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle system
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.hue = Math.random() * 60 + 200; // Blue to purple range
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;

        // Mouse interaction
        const dx = mousePosition.x - this.x;
        const dy = mousePosition.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          this.x -= (dx / distance) * force * 2;
          this.y -= (dy / distance) * force * 2;
        }
      }

      draw() {
        ctx.fillStyle = `hsla(${this.hue}, 70%, 50%, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    const particleArray = [];
    for (let i = 0; i < 100; i++) {
      particleArray.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = theme === 'dark' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particleArray.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particleArray.forEach((particle, index) => {
        for (let j = index + 1; j < particleArray.length; j++) {
          const dx = particleArray[j].x - particle.x;
          const dy = particleArray[j].y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = `hsla(${particle.hue}, 70%, 50%, ${0.2 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particleArray[j].x, particleArray[j].y);
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Handle mouse movement
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme, mousePosition]);

  // Floating shapes
  const FloatingShape = ({ delay, duration, size, color }) => (
    <motion.div
      className="absolute rounded-full opacity-20"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
      initial={{
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + size,
        rotate: 0
      }}
      animate={{
        x: [null, Math.random() * window.innerWidth],
        y: [-size, -size],
        rotate: [0, 360]
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  );

  // Gradient orb
  const GradientOrb = ({ x, y, size }) => (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 50%, rgba(236, 72, 153, 0.3) 100%)`,
        filter: 'blur(40px)'
      }}
      animate={{
        x: [x, x + 50, x],
        y: [y, y - 30, y],
        scale: [1, 1.2, 1]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Canvas for particle system */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />

      {/* Floating shapes */}
      <FloatingShape delay={0} duration={20} size={60} color="rgba(59, 130, 246, 0.3)" />
      <FloatingShape delay={2} duration={25} size={40} color="rgba(147, 51, 234, 0.3)" />
      <FloatingShape delay={4} duration={30} size={80} color="rgba(236, 72, 153, 0.3)" />
      <FloatingShape delay={6} duration={22} size={50} color="rgba(34, 197, 94, 0.3)" />
      <FloatingShape delay={8} duration={28} size={70} color="rgba(251, 146, 60, 0.3)" />

      {/* Gradient orbs */}
      <GradientOrb x={100} y={100} size={300} />
      <GradientOrb x={window.innerWidth - 200} y={200} size={250} />
      <GradientOrb x={window.innerWidth / 2} y={window.innerHeight - 150} size={200} />

      {/* Animated grid pattern */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <pattern
            id="grid"
            width={40}
            height={40}
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Pulse rings */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute rounded-full border border-blue-500/20"
            style={{
              width: 200 + index * 100,
              height: 200 + index * 100,
              left: -(100 + index * 50),
              top: -(100 + index * 50)
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{
              duration: 4,
              delay: index * 1.3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
      </motion.div>

      {/* Aurora effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `linear-gradient(45deg, 
            transparent 30%, 
            rgba(59, 130, 246, 0.1) 50%, 
            transparent 70%)`
        }}
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
