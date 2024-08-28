
import numpy
import matplotlib.pyplot as plt
import matplotlib.animation as animation


def run_simulation(n_pendulums, d_diff, t_max, g, m1, m2, L1, L2, theta1, theta2, colormap, background):
    """
    run double pendulum simulation and creating double_pendulum_animation.mp4
    :param n_pendulums: number of pendulums
    :param d_diff: difference between pendulums
    :param t_max: time of simulation
    :param g: gravitational acceleration
    :param m1: mass 1
    :param m2: mass 2
    :param L1: length 1
    :param L2: length 2
    :param theta1: theta 1
    :param theta2: theta 2
    :param colormap: colormap for pendulums colors
    :param background: background color
    :return:
    """
    g = -g

    # step
    dt = 1 / 60
    n_steps = int(t_max / dt)

    # lists of lists for results
    theta1_arr = []
    theta2_arr = []
    for i in range(n_pendulums):
        theta11_arr = numpy.zeros(n_steps)
        theta21_arr = numpy.zeros(n_steps)
        theta1_arr.append(theta11_arr)
        theta2_arr.append(theta21_arr)
    t_arr = numpy.zeros(n_steps)

    # saving initial conditions as a first result
    t_arr[0] = 0
    p1 = []
    p2 = []

    for i in range(n_pendulums):
        theta1 += i * d_diff
        theta2 += i * d_diff
        theta1_arr[i][0] = theta1
        theta2_arr[i][0] = theta2
        p1.append(0)
        p2.append(0)

    # using hamilton canonical equations of motion
    def theta1_dot(p1, p2, theta1, theta2, L1, L2):
        """
        :param p1: momentum1
        :param p2: momentum2
        :param theta1: degree1
        :param theta2: degree2
        :param L1: length 1
        :param L2: length 2
        :return: right side of ODE for dtheta1/dt
        """
        return (L2 * p1 - L1 * p2 * numpy.cos(theta1 - theta2)) / (L1**2 * L2 * (m1 + m2 * (numpy.sin(theta1 - theta2))**2))

    def theta2_dot(p1, p2, theta1, theta2, L1, L2):
        """
         :param p1: momentum1
        :param p2: momentum2
        :param theta1: degree1
        :param theta2: degree2
        :param L1: length 1
        :param L2: length 2
        :return: right side of ODE for dtheta2/dt
        """
        return (L1 * (m1 + m2) * p2 - L2 * m2 * p1 * numpy.cos(theta1 - theta2)) / (L1 * L2**2 * m2 * (m1 + m2 * numpy.sin(theta1 - theta2)**2))

    def p1_dot(p1, p2, theta1, theta2, L1, L2):
        """
        :param p1: momentum1
        :param p2: momentum2
        :param theta1: degree1
        :param theta2: degree2
        :param L1: length 1
        :param L2: length 2
        :return: right side of ODE for dp1/dt
        """
        sin_theta_diff = numpy.sin(theta1 - theta2)
        cos_theta_diff = numpy.cos(theta1 - theta2)
        sin_2theta_diff = numpy.sin(2 * (theta1 - theta2))

        term1 = -(m1 + m2) * g * L1 * numpy.sin(theta1)
        term2 = (p1 * p2 * sin_theta_diff) / (L1 * L2 * (m1 + m2 * sin_theta_diff ** 2))
        term3_num = (m2 * L2 ** 2 * p1 ** 2 + (m1 + m2) * L1 ** 2 * p2 ** 2 - 2 * m2 * L1 * L2 * p1 * p2 * cos_theta_diff)
        term3_den = (2 * L1 ** 2 * L2 ** 2 * (m1 + m2 * sin_theta_diff ** 2) ** 2)
        term3 = (term3_num / term3_den) * sin_2theta_diff

        return term1 - term2 + term3

    def p2_dot(p1, p2, theta1, theta2, L1, L2):
        """
        :param p1: momentum1
        :param p2: momentum2
        :param theta1: degree1
        :param theta2: degree2
        :param L1: length 1
        :param L2: length 2
        :return: right side of ODE for dp2/dt
        """
        sin_theta_diff = numpy.sin(theta1 - theta2)
        cos_theta_diff = numpy.cos(theta1 - theta2)
        sin_2theta_diff = numpy.sin(2 * (theta1 - theta2))

        term1 = -m2 * g * L2 * numpy.sin(theta2)
        term2 = (p1 * p2 * sin_theta_diff) / (L1 * L2 * (m1 + m2 * sin_theta_diff ** 2))
        term3_num = (m2 * L2 ** 2 * p1 ** 2 + (m1 + m2) * L1 ** 2 * p2 ** 2 - 2 * m2 * L1 * L2 * p1 * p2 * cos_theta_diff)
        term3_den = (2 * L1 ** 2 * L2 ** 2 * (m1 + m2 * sin_theta_diff ** 2) ** 2)
        term3 = (term3_num / term3_den) * sin_2theta_diff

        return term1 + term2 - term3

    def runge_kutta(n_steps, dt, t_arr, theta1_arr, theta2_arr, p1, p2, L1, L2, n_pendulums):
        """
        solving ODEs with classic runge-kutta method (RK4)
        :param n_steps: number of steps (iterations)
        :param dt: time step
        :param t_arr: time array
        :param theta1_arr: saving result for degree1
        :param theta2_arr: results for degree2
        :param p1: momentum1
        :param p2: momentum2
        :param L1: length 1
        :param L2: length 2
        :return: lists od results (degrees, time)
        """
        for j in range(n_pendulums):
            for i in range(1, n_steps):
                # values from last iteration
                t_arr[i] = i * dt
                theta1 = theta1_arr[j][i - 1]
                theta2 = theta2_arr[j][i - 1]

                # runge-kutta
                # k1
                th1_k1 = dt * theta1_dot(p1[j], p2[j], theta1, theta2, L1, L2)
                th2_k1 = dt * theta2_dot(p1[j], p2[j], theta1, theta2, L1, L2)
                p1_k1 = dt * p1_dot(p1[j], p2[j], theta1, theta2, L1, L2)
                p2_k1 = dt * p2_dot(p1[j], p2[j], theta1, theta2, L1, L2)

                # k2
                th1 = theta1 + th1_k1 / 2
                th2 = theta2 + th2_k1 / 2
                p1k = p1[j] + p1_k1 / 2
                p2k = p2[j] + p2_k1 / 2
                th1_k2 = dt * theta1_dot(p1k, p2k, th1, th2, L1, L2)
                th2_k2 = dt * theta2_dot(p1k, p2k, th1, th2, L1, L2)
                p1_k2 = dt * p1_dot(p1k, p2k, th1, th2, L1, L2)
                p2_k2 = dt * p2_dot(p1k, p2k, th1, th2, L1, L2)

                # k3
                th1 = theta1 + th1_k2 / 2
                th2 = theta2 + th2_k2 / 2
                p1k = p1[j] + p1_k2 / 2
                p2k = p2[j] + p2_k2 / 2
                th1_k3 = dt * theta1_dot(p1k, p2k, th1, th2, L1, L2)
                th2_k3 = dt * theta2_dot(p1k, p2k, th1, th2, L1, L2)
                p1_k3 = dt * p1_dot(p1k, p2k, th1, th2, L1, L2)
                p2_k3 = dt * p2_dot(p1k, p2k, th1, th2, L1, L2)

                # k4
                th1 = theta1 + th1_k3
                th2 = theta2 + th2_k3
                p1k = p1[j] + p1_k3
                p2k = p2[j] + p2_k3
                th1_k4 = dt * theta1_dot(p1k, p2k, th1, th2, L1, L2)
                th2_k4 = dt * theta2_dot(p1k, p2k, th1, th2, L1, L2)
                p1_k4 = dt * p1_dot(p1k, p2k, th1, th2, L1, L2)
                p2_k4 = dt * p2_dot(p1k, p2k, th1, th2, L1, L2)

                # core of the method
                theta1 += (1 / 6) * (th1_k1 + 2 * th1_k2 + 2 * th1_k3 + th1_k4)
                theta2 += (1 / 6) * (th2_k1 + 2 * th2_k2 + 2 * th2_k3 + th2_k4)
                p1[j] += (1 / 6) * (p1_k1 + 2 * p1_k2 + 2 * p1_k3 + p1_k4)
                p2[j] += (1 / 6) * (p2_k1 + 2 * p2_k2 + 2 * p2_k3 + p2_k4)

                # saving results to arrays
                theta1_arr[j][i] = theta1
                theta2_arr[j][i] = theta2

        return t_arr, theta1_arr, theta2_arr

    def back_to_cartesian(theta1_arr, theta2_arr, L1, L2, n_steps, n_pendulums):
        """
        conversion of generalized coordinates to cartesian
        :param theta1_arr: result list of degree 1
        :param theta2_arr: result list of degree 2
        :param L1: length 1
        :param L2: length 2
        :param n_steps: number of steps
        :return: coordinates of two pendulum masses in cartesian system
        """
        # lists of cartesian coordinates
        x1 = []
        x2 = []
        y1 = []
        y2 = []
        for j in range(n_pendulums):
            x11 = []
            x21 = []
            y11 = []
            y21 = []
            for i in range(n_steps):
                # convert, then append to corresponding list
                x1s = L1 * numpy.sin(theta1_arr[j][i])
                x11.append(x1s)

                x2s = x1s + L2 * numpy.sin(theta2_arr[j][i])
                x21.append(x2s)

                y1s = L1 * numpy.cos(theta1_arr[j][i])
                y11.append(y1s)

                y2s = y1s + L2 * numpy.cos(theta2_arr[j][i])
                y21.append(y2s)
            x1.append(x11)
            x2.append(x21)
            y1.append(y11)
            y2.append(y21)
        return x1, y1, x2, y2

    def animace(x1, y1, x2, y2, n_steps, dt, n_pendulums, colormap, background):
        total_frames = n_steps
        fps = 1 / dt

        # Create figure and axis
        fig, ax = plt.subplots(figsize=(5, 5))
        fig.subplots_adjust(left=0, bottom=0, right=1, top=1, wspace=None, hspace=None)
        ax.set_xlim(-2.5, 2.5)
        ax.set_ylim(-2.5, 2.5)
        ax.set_aspect('equal')

        # Hide the numbers on the axes
        ax.set_xticks([])
        ax.set_yticks([])

        # Hide the axes
        ax.axis('off')

        # Set the background color or image
        fig.patch.set_facecolor(f'{background}')

        # taking out, cause it takes too much time with img background
        '''else:
            try:
                # Load and display the background image
                img = plt.imread(f'./static/{background}.jpg')
                ax.imshow(img, extent=[-2.5, 2.5, -2.5, 2.5], aspect='auto')
            except FileNotFoundError:
                print(f"Background image for '{background}' not found. Using default white background.")
                fig.patch.set_facecolor('white')'''

        # Use a colormap to get different colors
        cmap = plt.colormaps.get_cmap(colormap)
        colors = [cmap(i / n_pendulums) for i in range(n_pendulums)]

        # Initialize the lines for the rods and the dots for the masses for each pendulum
        lines1 = []
        lines2 = []
        trajectories = []

        for i in range(n_pendulums):
            line1, = ax.plot([], [], '-', lw=2, color=colors[i])
            line2, = ax.plot([], [], '-', lw=2, color=colors[i])
            trajectory, = ax.plot([], [], lw=1, color=colors[i], alpha=0.5)
            lines1.append(line1)
            lines2.append(line2)
            trajectories.append(trajectory)

        # Initialization function
        def init():
            for i in range(n_pendulums):
                lines1[i].set_data([], [])
                lines2[i].set_data([], [])
                trajectories[i].set_data([], [])
            return lines1 + lines2 + trajectories

        # Variables to store trajectory data for each pendulum
        x2_traj = [[] for _ in range(n_pendulums)]
        y2_traj = [[] for _ in range(n_pendulums)]

        # Update function for each frame
        def update(frame):
            for i in range(n_pendulums):
                # Update trajectory data
                x2_traj[i].append(x2[i][frame])
                y2_traj[i].append(y2[i][frame])
                trajectories[i].set_data(x2_traj[i], y2_traj[i])

                # First rod (pivot to first mass)
                x_data1 = [0, x1[i][frame]]
                y_data1 = [0, y1[i][frame]]
                lines1[i].set_data(x_data1, y_data1)

                # Second rod (first mass to second mass)
                x_data2 = [x1[i][frame], x2[i][frame]]
                y_data2 = [y1[i][frame], y2[i][frame]]
                lines2[i].set_data(x_data2, y_data2)

            return trajectories + lines1 + lines2

        '''frame_to_save = int(4.95 * fps)  # Frame at 5 second
        # Update the plot for all frames up to the frame_to_save
        for frame in range(frame_to_save + 1):
            update(frame)
        plt.savefig(f'double_pendulum_thumbnail.png', bbox_inches='tight', pad_inches=0)  # Save the frame as an image

        # Clear the plot data before starting the animation
        for i in range(n_pendulums):
            lines1[i].set_data([], [])
            lines2[i].set_data([], [])
            trajectories[i].set_data([], [])
        x2_traj = [[] for _ in range(n_pendulums)]
        y2_traj = [[] for _ in range(n_pendulums)]'''

        # Create the animation
        ani = animation.FuncAnimation(fig, update, frames=total_frames, init_func=init, blit=True,
                                      interval=1000 / fps)

        # If you want to save, not only show animation
        Writer = animation.writers['ffmpeg']
        writer = Writer(fps=fps, metadata=dict(artist='Me'), bitrate=1800)

        # Save the animation as an MP4 file
        ani.save('double_pendulum_animation.mp4', writer=writer)

    t_arr, theta1_arr, theta2_arr = runge_kutta(n_steps, dt, t_arr, theta1_arr, theta2_arr, p1, p2, L1, L2, n_pendulums)
    x1, y1, x2, y2 = back_to_cartesian(theta1_arr, theta2_arr, L1, L2, n_steps, n_pendulums)
    animace(x1, y1, x2, y2, n_steps, dt, n_pendulums, colormap, background)


