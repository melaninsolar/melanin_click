import tkinter as tk
import os
import urllib.request
import tarfile
import threading
import subprocess
from PIL import Image, ImageTk
import tkinter.messagebox as msgbox
from tkinter import simpledialog, messagebox
import secrets
import string

class Application(tk.Tk):
    def __init__(self, *args, **kwargs):
        tk.Tk.__init__(self, *args, **kwargs)

        # Set the window title
        self.title("Melanin Click")

        self.container = tk.Frame(self)
        self.container.pack(side="top", fill="both", expand=True)
        self.container.grid_rowconfigure(0, weight=1)
        self.container.grid_columnconfigure(0, weight=1)

        self.frames = {}
        for F in (StartPage, TermsPage, InstallPage):
            frame = F(self.container, self)
            self.frames[F] = frame
            frame.grid(row=0, column=0, sticky="nsew")

        self.show_frame(StartPage)

    def show_frame(self, page):
        frame = self.frames[page]
        frame.tkraise()

class StartPage(tk.Frame):
    def __init__(self, parent, controller):
        tk.Frame.__init__(self, parent)

        # Pack the text label right below the image
        label = tk.Label(self, text="Welcome to the Installation Wizard!")
        label.pack(pady=10, padx=10, anchor='center')

        # Pack the button right below the welcome message
        button = tk.Button(self, text="Next",
                           command=lambda: controller.show_frame(TermsPage))
        button.pack(anchor='center')

class TermsPage(tk.Frame):
    def __init__(self, parent, controller):
        tk.Frame.__init__(self, parent)
        self.controller = controller

        self.text = tk.Text(self, width=80, height=20)
        self.text.pack(padx=5, pady=5)

        self.terms_accepted = tk.BooleanVar()
        self.accept_button = tk.Checkbutton(self, text="I accept the Terms and Conditions",
                                            variable=self.terms_accepted,
                                            command=self.toggle_next_button)
        self.accept_button.pack()

        self.next_button = tk.Button(self, text="Next", state='disabled',
                                     command=lambda: controller.show_frame(InstallPage))
        self.next_button.pack(pady=10)

        self.load_terms()

    def toggle_next_button(self):
        if self.terms_accepted.get():
            self.next_button.config(state='normal')
        else:
            self.next_button.config(state='disabled')

    def load_terms(self):
        url = "https://raw.githubusercontent.com/melaninsolar/melaninclick/main/melanin_click_terms_of_use.md"
        try:
            with urllib.request.urlopen(url) as response:
                html = response.read().decode()
        except urllib.error.URLError:
            html = "Failed to load Terms and Conditions. Please check your internet connection and try again."

        self.text.insert('end', html)
        self.text.config(state='disabled')

class InstallPage(tk.Frame):
    def __init__(self, parent, controller):
        tk.Frame.__init__(self, parent)

        self.output = tk.Text(self, state='disabled', width=70, height=20)
        self.output.pack(padx=5, pady=5)

        frame = tk.Frame(self)
        frame.pack(pady=20, padx=20)

        # Add a separator between Bitcoin Core and screen
        separator1 = tk.Frame(frame, height=2, bg="black", width=frame.winfo_width())
        separator1.grid(row=0, columnspan=3, pady=10, sticky='ew')

        # Bitcoin Core Installation
        self.install_bitcoin_button = tk.Button(frame, text="Install Bitcoin Core", command=self.check_storage_and_install_bitcoin)
        self.install_bitcoin_button.grid(row=0, column=0, padx=10, pady=5)

        # Run Mainnet Bitcoin Core
        self.run_mainnet_button = tk.Button(frame, text="Run Full Bitcoin Node", state='disabled')
        self.run_mainnet_button.grid(row=0, column=1, padx=10, pady=5)

        # Run Pruned Bitcoin Node
        self.run_pruned_node_button = tk.Button(frame, text="Run Pruned Bitcoin Node", command=self.run_pruned_node)
        self.run_pruned_node_button.grid(row=0, column=2, padx=10, pady=5)

        # Public Pool Button for Bitcoin CPU Miner
        self.public_pool_button = tk.Button(frame, text="Connect to Public Pool", command=self.run_bitcoin_miner)
        self.public_pool_button.grid(row=1, column=1, padx=10, pady=5, columnspan=1)

        # Add a separator between Bitcoin Core and Lightning (Lnd)
        separator1 = tk.Frame(frame, height=2, bg="black", width=frame.winfo_width())
        separator1.grid(row=2, columnspan=3, pady=10, sticky='ew')

        # Add a separator between Lightning (Lnd) and Whive Core
        separator2 = tk.Frame(frame, height=2, bg="black", width=frame.winfo_width())
        separator2.grid(row=3, columnspan=3, pady=10, sticky='ew')

        # Whive Core
        self.install_whive_button = tk.Button(frame, text="Install Whive Core", command=self.install_whive)
        self.install_whive_button.grid(row=3, column=0, padx=10, pady=5)

        self.run_whive_button = tk.Button(frame, text="Run Whive Core", state='disabled', command=self.run_whive)
        self.run_whive_button.grid(row=3, column=1, padx=10, pady=5)

        # Whive CpuMiner section
        self.whive_address_label = tk.Label(self, text="Whive Address: None")
        self.whive_address_label.pack()

        self.run_cpuminer_button = tk.Button(frame, text="Run Whive CpuMiner", command=self.run_whive_miner)
        self.run_cpuminer_button.grid(row=4, column=0, padx=10, pady=5)

        # Add a separator between Whive Core and Bitcoin Nerd Miner
        separator3 = tk.Frame(frame, height=2, bg="black", width=frame.winfo_width())
        separator3.grid(row=5, columnspan=3, pady=10, sticky='ew')

        # Help and Quit
        self.help_button = tk.Button(frame, text="Help", command=self.display_help)
        self.help_button.grid(row=6, column=0, padx=10, pady=5, columnspan=3)

        self.quit_button = tk.Button(frame, text="Quit", command=controller.quit)
        self.quit_button.grid(row=7, column=0, padx=10, pady=5, columnspan=3)

    def create_bitcoin_conf(self, conf_path, prune=False):
        """Create bitcoin.conf for either full node or pruned node."""

        # Ensure the directory for the configuration exists
        conf_dir = os.path.dirname(conf_path)
        os.makedirs(conf_dir, exist_ok=True)

        # Content of the configuration file
        content = """
        prune=550
        daemon=1
        """ if prune else """
        daemon=1
        """

        # Write the configuration file
        with open(conf_path, 'w') as file:
            file.write(content)
        self.update_output(f"bitcoin.conf created at {conf_path}")

    def check_storage_and_install_bitcoin(self):
        s = os.statvfs('/')
        free_space = s.f_frsize * s.f_bavail / (10**9)  # free space in GB

        if free_space > 600:
            threading.Thread(target=self.install, args=('bitcoin', "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-osx64.tar.gz")).start()
        elif free_space > 10:
            self.install_pruned_bitcoin()
        else:
            self.update_output("Insufficient storage space for Bitcoin. Please free up some space and try again.")

    def install_pruned_bitcoin(self):
        """Install pruned version of Bitcoin Core and store config in ~/.bitcoin/pruned/."""
        self.update_output("Installing pruned Bitcoin node...")

        # Ensure the pruned config directory exists
        pruned_dir = os.path.join(os.path.expanduser('~'), ".bitcoin/pruned")
        os.makedirs(pruned_dir, exist_ok=True)

        # Create pruned bitcoin.conf file
        conf_path = os.path.join(pruned_dir, "bitcoin.conf")
        self.create_bitcoin_conf(conf_path, prune=True)

        threading.Thread(target=self.install, args=('bitcoin', "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-osx64.tar.gz")).start()

    def run_mainnet(self):
        """Run Bitcoin in mainnet mode with config from ~/.bitcoin/mainnet/bitcoin.conf."""
        bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt")
        mainnet_conf_dir = os.path.join(os.path.expanduser('~'), ".bitcoin/mainnet")

        if not os.path.exists(bitcoin_path):
            bitcoin_path = "/Applications/Bitcoin-qt.app/Contents/MacOS/Bitcoin-qt"

        if not os.path.exists(bitcoin_path):
            self.update_output("Error: Could not find a valid Bitcoin installation.")
            return

        # Ensure mainnet config directory exists and create if not
        os.makedirs(mainnet_conf_dir, exist_ok=True)
        conf_path = os.path.join(mainnet_conf_dir, "bitcoin.conf")
        if not os.path.exists(conf_path):
            self.create_bitcoin_conf(conf_path, prune=False)

        # Run the Bitcoin Core with the mainnet configuration
        self.run_software(bitcoin_path, f"-conf={conf_path}")

    def run_pruned_node(self):
        """Run pruned Bitcoin node with config from ~/.bitcoin/pruned/bitcoin.conf."""
        pruned_bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt")
        pruned_conf_dir = os.path.join(os.path.expanduser('~'), ".bitcoin/pruned")

        if not os.path.exists(pruned_bitcoin_path):
            self.update_output("Error: Could not find the pruned Bitcoin node installation.")
            return

        # Ensure pruned config directory exists
        conf_path = os.path.join(pruned_conf_dir, "bitcoin.conf")
        if not os.path.exists(conf_path):
            self.create_bitcoin_conf(conf_path, prune=True)

        # Run the pruned Bitcoin node with the pruned configuration
        self.run_software(pruned_bitcoin_path, f"--datadir={pruned_conf_dir}", f"-conf={conf_path}")

    def run_bitcoin_miner(self):
        disclaimer_text = ("Disclaimer: Running the CPU miner in Melanin Click for an extended period of time on your machine may result "
                        "in increased wear and tear, overheating, and decreased performance of your hardware. Prolonged mining operations "
                        "have been known to consume significant electrical resources and may potentially lead to hardware failure. We highly "
                        "recommend using a dedicated machine equipped with adequate cooling mechanisms for mining activities. This is a summary "
                        "of potential risks, and we encourage you to refer to the entire disclaimer for a comprehensive understanding of the terms and conditions.")

        agreement = messagebox.askyesno("Disclaimer", disclaimer_text)

        if not agreement:
            return

        bitcoin_address = simpledialog.askstring("Input", "Please enter your Bitcoin address:")
        machine_name = simpledialog.askstring("Input", "Please enter your machine name:")

        while not bitcoin_address or not machine_name:
            messagebox.showwarning("Warning", "Please provide valid Bitcoin address and machine name.")
            bitcoin_address = simpledialog.askstring("Input", "Please enter your Bitcoin address:")
            machine_name = simpledialog.askstring("Input", "Please enter your machine name:")

        self.update_output(f"Bitcoin Address: {bitcoin_address}")
        self.update_output(f"Machine Name: {machine_name}")

        minerd_path = os.path.expanduser('~/cpuminer-opt-mac/cpuminer-sse2')

        if not os.path.exists(minerd_path):
            self.update_output("Bitcoin miner not found. Downloading and extracting...")
            download_url = "https://github.com/rplant8/cpuminer-opt-rplant/releases/download/5.0.36/cpuminer-opt-mac.tar.gz"
            self.download_and_extract_miner(download_url)

        cmd = f'{minerd_path} -a sha256d -o stratum+tcp://public-pool.io:21496 -u {bitcoin_address}.{machine_name} -p x'

        # macOS: Open a new terminal window and run the miner command
        osascript_cmd = f'osascript -e \'tell application "Terminal" to do script "{cmd}"\''
        subprocess.Popen(osascript_cmd, shell=True)
        self.update_output("Opened a new terminal for Bitcoin mining.")

    def download_and_extract_miner(self, url, extract_to='~/cpuminer-opt-mac'):
        extract_to = os.path.expanduser(extract_to)
        if not os.path.exists(extract_to):
            os.makedirs(extract_to)

        try:
            urllib.request.urlretrieve(url, os.path.join(extract_to, 'cpuminer-opt-mac.tar.gz'))
            with tarfile.open(os.path.join(extract_to, 'cpuminer-opt-mac.tar.gz'), "r:gz") as tar:
                tar.extractall(path=extract_to)
            os.remove(os.path.join(extract_to, 'cpuminer-opt-mac.tar.gz'))
            self.update_output("Download and extraction complete.")
        except Exception as e:
            self.update_output(f"Error in downloading or extracting the miner: {e}")

    def run_whive_miner(self):
        disclaimer_text = ("Disclaimer: Running the CPU miner in Melanin Click for an extended period of time on your machine may result "
                        "in increased wear and tear, overheating, and decreased performance of your hardware. Prolonged mining operations "
                        "have been known to consume significant electrical resources and may potentially lead to hardware failure. We highly "
                        "recommend using a dedicated machine equipped with adequate cooling mechanisms for mining activities. This is a summary "
                        "of potential risks, and we encourage you to refer to the entire disclaimer for a comprehensive understanding of the terms and conditions.")

        agreement = msgbox.askyesno("Disclaimer", disclaimer_text)

        if not agreement:
            return

        address = simpledialog.askstring("Input", "Please enter your Whive address:")

        while not address:
            messagebox.showwarning("Warning", "Please provide a valid Whive address.")
            address = simpledialog.askstring("Input", "Please enter your Whive address:")

        self.update_output(f"Whive Address: {address}")
        self.whive_address_label.config(text=f"Whive Address: {address}")

        minerd_path = os.path.expanduser('~/cpuminer-opt-mac/cpuminer-sse2')

        if not os.path.exists(minerd_path):
            self.update_output("Whive miner not found. Downloading and extracting...")
            download_url = "https://github.com/rplant8/cpuminer-opt-rplant/releases/download/5.0.36/cpuminer-opt-mac.tar.gz"
            self.download_and_extract_miner(download_url)

        cmd = f'{minerd_path} -a yespower -o stratum+tcp://206.189.2.17:3333 -u {address}.w1 -t 2'

        # macOS: Open a new terminal window and run the miner command
        osascript_cmd = f'osascript -e \'tell application "Terminal" to do script "{cmd}"\''
        subprocess.Popen(osascript_cmd, shell=True)
        self.update_output("Opened a new terminal for Whive mining.")


    def schedule_update_output(self, message):
        self.after(0, self.update_output, message)

    def install_whive(self):
        threading.Thread(target=self.install, args=('whive', "https://github.com/whiveio/whive/releases/download/22.2.2/whive-22.2.2-osx64.tar.gz")).start()

    def install(self, software, download_url):
        self.update_output(f"Installing {software}...")

        install_path = os.path.join(os.path.expanduser('~'), f"{software}-core")
        downloaded_file = os.path.join(install_path, f"{software}.tar.gz")

        os.makedirs(install_path, exist_ok=True)
        self.update_output(f"Created installation directory at {install_path}")

        urllib.request.urlretrieve(download_url, downloaded_file)

        self.schedule_update_output("Extracting tarball...")
        with tarfile.open(downloaded_file, "r:gz") as tar:
            tar.extractall(path=install_path)
        os.remove(downloaded_file)
        self.schedule_update_output(f"{software} installation complete!")

        if software == 'whive':
            self.run_whive_button.config(state='normal')
        elif software.startswith('bitcoin'):
            self.run_bitcoin_button.config(state='normal')

        self.quit_button.config(state='normal')

    def run_whive(self):
        whive_path = os.path.join(os.path.expanduser('~'), "whive-core", "whive", "bin", "whive-qt")
        self.run_software(whive_path)

    def run_software(self, software_path, *args):
        self.update_output(f"Running software from {software_path}")
        subprocess.Popen([software_path, *args])

    def display_help(self):
        self.update_output("This is the help section. You can add instructions here or open a help file.")

    def update_output(self, message):
        self.output.config(state='normal')
        self.output.insert('end', message + "\n")
        self.output.config(state='disabled')
        self.output.see('end')

app = Application()
app.mainloop()

