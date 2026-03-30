import { useEffect, useRef } from 'react'

const LavaLamp = () => {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const colors = [
            'rgba(124, 58, 237,',
            'rgba(109, 40, 217,',
            'rgba(139, 92, 246,',
            'rgba(79, 70, 229,',
            'rgba(167, 139, 250,',
        ]

        const blobs = Array.from({ length: 12 }, (_, i) => ({
            x: Math.random() * canvas.width,
            y: canvas.height + Math.random() * 300,
            baseRadius: Math.random() * 40 + 20,
            radius: 0,
            speed: Math.random() * 0.4 + 0.2,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.03 + 0.01,
            wobbleAmount: Math.random() * 8 + 4,
            driftX: (Math.random() - 0.5) * 0.3,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: Math.random() * 0.12 + 0.06,
        }))

        let animId

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            blobs.forEach(blob => {
                // Rise upward
                blob.y -= blob.speed

                // Drift left and right gently
                blob.x += blob.driftX
                blob.wobble += blob.wobbleSpeed

                // Wobble the x position like jello
                const wobbleX = Math.sin(blob.wobble) * blob.wobbleAmount
                const wobbleY = Math.cos(blob.wobble * 0.7) * (blob.wobbleAmount * 0.5)

                // Slightly deform radius for jello effect
                blob.radius = blob.baseRadius + Math.sin(blob.wobble * 1.3) * 5

                // Reset when off screen top
                if (blob.y + blob.radius < 0) {
                    blob.y = canvas.height + blob.baseRadius
                    blob.x = Math.random() * canvas.width
                    blob.driftX = (Math.random() - 0.5) * 0.3
                }

                // Bounce off side walls
                if (blob.x < 0 || blob.x > canvas.width) blob.driftX *= -1

                // Draw blob with gradient for jello look
                const gradient = ctx.createRadialGradient(
                    blob.x + wobbleX - blob.radius * 0.3,
                    blob.y + wobbleY - blob.radius * 0.3,
                    0,
                    blob.x + wobbleX,
                    blob.y + wobbleY,
                    blob.radius
                )

                gradient.addColorStop(0, `${blob.color} ${blob.opacity * 2})`)
                gradient.addColorStop(0.5, `${blob.color} ${blob.opacity})`)
                gradient.addColorStop(1, `${blob.color} 0)`)

                ctx.beginPath()
                ctx.arc(
                    blob.x + wobbleX,
                    blob.y + wobbleY,
                    blob.radius,
                    0,
                    Math.PI * 2
                )
                ctx.fillStyle = gradient
                ctx.fill()
            })

            animId = requestAnimationFrame(draw)
        }

        draw()

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        window.addEventListener('resize', handleResize)

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: 1 }}
        />
    )
}

export default LavaLamp