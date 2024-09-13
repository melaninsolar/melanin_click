import tkinter as tk
import os
import urllib.request
import zipfile
import threading
import subprocess
from tkinter import simpledialog, messagebox
from PIL import Image, ImageTk
import requests
import psutil

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
        button = tk.Button(self, text="Next", command=lambda: controller.show_frame(TermsPage))
        button.pack(anchor='center')

class TermsPage(tk.Frame):
    def __init__(self, parent, controller):
        tk.Frame.__init__(self, parent)
        self.controller = controller

        self.text = tk.Text(self, width=80, height=20)
        self.text.pack(padx=5, pady=5)

        self.terms_accepted = tk.BooleanVar()
        self.accept_button = tk.Checkbutton(self, text="I accept the Terms and Conditions", variable=self.terms_accepted, command=self.toggle_next_button)
        self.accept_button.pack()

        self.next_button = tk.Button(self, text="Next", state='disabled', command=lambda: controller.show_frame(InstallPage))
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

        # Bitcoin Core
        self.install_bitcoin_button = tk.Button(frame, text="Install Bitcoin Core", command=self.check_storage_and_install_bitcoin)
        self.install_bitcoin_button.grid(row=0, column=0, padx=10, pady=5)

        self.run_bitcoin_button = tk.Button(frame, text="Run Bitcoin Core", state='disabled', command=self.run_bitcoin)
        self.run_bitcoin_button.grid(row=0, column=1, padx=10, pady=5)

        # Run Pruned Bitcoin Node
        self.run_pruned_node_button = tk.Button(frame, text="Run Pruned Bitcoin Node", state='disabled', command=self.run_pruned_node)
        self.run_pruned_node_button.grid(row=1, column=1, padx=10, pady=5)

        # Connect to Public Pool for Bitcoin Miner
        self.connect_public_pool_button = tk.Button(frame, text="Connect to Public Pool", command=self.run_bitcoin_miner)
        self.connect_public_pool_button.grid(row=2, column=1, padx=10, pady=5)

        # Whive Core
        self.install_whive_button = tk.Button(frame, text="Install Whive Core", command=self.install_whive)
        self.install_whive_button.grid(row=3, column=0, padx=10, pady=5)

        self.run_whive_button = tk.Button(frame, text="Run Whive Core", state='disabled', command=self.run_whive)
        self.run_whive_button.grid(row=3, column=1, padx=10, pady=5)

        # Whive CpuMiner section
        self.whive_address_label = tk.Label(self, text="Whive Address: None")
        self.whive_address_label.pack()

        self.run_cpuminer_button = tk.Button(frame, text="Run Whive CpuMiner", command=self.run_whive_miner)
        self.run_cpuminer_button.grid(row=4, column=1, padx=10, pady=5)

        self.whive_cli_path = os.path.join(os.path.expanduser('~'), "whive-core", "whive", "bin", "whive-cli")

        # Help and Quit
        self.help_button = tk.Button(frame, text="Help", command=self.display_help)
        self.help_button.grid(row=5, column=0, padx=10, pady=5, columnspan=2)

        self.quit_button = tk.Button(frame, text="Quit", command=controller.quit)
        self.quit_button.grid(row=6, column=0, padx=10, pady=5, columnspan=2)

    def check_storage_and_install_bitcoin(self):
        obj_Disk = psutil.disk_usage('C:/')  # Use the drive where you want to install
        free_space = obj_Disk.free / (10**9)  # free space in GB

        if free_space > 600:
            self.install('bitcoin', "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-win64.zip")
        elif free_space > 10:
            self.install_pruned_bitcoin()
        else:
            self.update_output("Insufficient storage space for Bitcoin. Please free up some space and try again.")

    def install_pruned_bitcoin(self):
        self.install('bitcoin', "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-win64.zip")
        self.run_pruned_node_button.config(state='normal')

    def install_whive(self):
        self.install('whive', "https://github.com/whiveio/whive/releases/download/22.2.2/whive-22.2.2-win64.zip")

    def install(self, software, download_url):
        self.update_output(f"Installing {software}...")

        # Use 'bitcoin-core' for both pruned and full installations
        install_path = os.path.join(os.path.expanduser('~'), "bitcoin-core" if software == 'bitcoin' else f"{software}-core")
        downloaded_file = os.path.join(install_path, f"{software}.zip")  # Change extension to .zip

        # Create installation directory if it doesn't exist
        os.makedirs(install_path, exist_ok=True)
        self.update_output(f"Created installation directory at {install_path}")

        # Download the file using requests
        self.update_output(f"Downloading {software} from {download_url}")
        response = requests.get(download_url, stream=True)
        with open(downloaded_file, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        # Extract the zip and delete it
        self.update_output("Extracting zip file...")
        with zipfile.ZipFile(downloaded_file, 'r') as zip_ref:
            zip_ref.extractall(path=install_path)
        os.remove(downloaded_file)
        self.update_output(f"{software} installation complete!")

        # Enable the respective run buttons
        if software == 'whive':
            self.run_whive_button.config(state='normal')
        elif software == 'bitcoin':
            self.run_bitcoin_button.config(state='normal')
            self.run_pruned_node_button.config(state='normal')

    def run_whive(self):
        whive_path = os.path.join(os.path.expanduser('~'), "whive-core", "whive", "bin", "whive-qt.exe")
        self.run_software(whive_path)

    def run_bitcoin(self):
        bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt.exe")
        if os.path.exists(bitcoin_path):
            self.run_software(bitcoin_path)
        else:
            self.update_output("Bitcoin software not found. Please install first.")

    def run_pruned_node(self):
        pruned_data_dir = os.path.join(os.path.expanduser('~'), "pruned-bitcoin")
        bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt.exe")
        
        if not os.path.exists(pruned_data_dir):
            os.makedirs(pruned_data_dir)
        bitcoin_conf_path = os.path.join(pruned_data_dir, "bitcoin.conf")
        if not os.path.exists(bitcoin_conf_path):
            self.create_bitcoin_conf(bitcoin_conf_path)

        if os.path.exists(bitcoin_path):
            self.run_software(bitcoin_path, f'--datadir={pruned_data_dir}')
        else:
            self.update_output("Bitcoin software not found. Please install first.")

    def create_bitcoin_conf(self, conf_path):
        conf_content = """
        prune=550
        daemon=1
        """
        with open(conf_path, 'w') as conf_file:
            conf_file.write(conf_content)
        self.update_output("Created pruned bitcoin.conf file.")

    def run_bitcoin_miner(self):
        # Display the disclaimer
        disclaimer_text = ("Disclaimer: Running the Bitcoin CPU miner in Melanin Click for an extended period of time on your machine may result "
                           "in increased wear and tear, overheating, and decreased performance of your hardware.")
        agreement = messagebox.askyesno("Disclaimer", disclaimer_text)

        if not agreement:
            return

        bitcoin_address = simpledialog.askstring("Input", "Please enter your Bitcoin address:")
        machine_name = simpledialog.askstring("Input", "Please enter your machine name:")

        while not bitcoin_address or not machine_name:
            messagebox.showwarning("Warning", "Please provide valid Bitcoin address and machine name.")
            bitcoin_address = simpledialog.askstring("Input", "Please enter your Bitcoin address:")
            machine_name = simpledialog.askstring("Input", "Please enter your machine name:")

        cpuminer_path = os.path.expanduser('~/cpuminer-opt-win-5.0.40/cpuminer-sse2.exe')
        
        if not os.path.exists(cpuminer_path):
            self.update_output("Bitcoin miner not found. Downloading and extracting...")
            download_url = "https://github.com/rplant8/cpuminer-opt-rplant/releases/download/5.0.40/cpuminer-opt-win-5.0.40.zip"
            self.download_and_extract_miner(download_url)

        cmd = f'{cpuminer_path} -a sha256d -o stratum+tcp://public-pool.io:21496 -u {bitcoin_address}.{machine_name} -p x'

        # Open the miner in a new terminal window
        subprocess.Popen(['start', 'cmd', '/c', cmd], shell=True)
        self.update_output("Opened a new terminal for Bitcoin mining.")

    def run_whive_miner(self):
        # Display the disclaimer
        disclaimer_text = ("Disclaimer: Running the CPU miner in Melanin Click for an extended period of time on your machine may result "
                           "in increased wear and tear, overheating, and decreased performance of your hardware.")
        agreement = messagebox.askyesno("Disclaimer", disclaimer_text)

        if not agreement:
            return

        whive_address = simpledialog.askstring("Input", "Please enter your Whive address:")

        while not whive_address:
            messagebox.showwarning("Warning", "Please provide a valid Whive address.")
            whive_address = simpledialog.askstring("Input", "Please enter your Whive address:")

        self.whive_address_label.config(text=f"Whive Address: {whive_address}")
        cpuminer_path = os.path.expanduser('~/cpuminer-opt-win-5.0.40/cpuminer-sse2.exe')
        
        if not os.path.exists(cpuminer_path):
            self.update_output("Whive miner not found. Downloading and extracting...")
            download_url = "https://github.com/rplant8/cpuminer-opt-rplant/releases/download/5.0.40/cpuminer-opt-win-5.0.40.zip"
            self.download_and_extract_miner(download_url)

        cmd = f'{cpuminer_path} -a yespower -o stratum+tcp://206.189.2.17:3333 -u {whive_address}.w1 -t 2'

        # Open the miner in a new terminal window
        subprocess.Popen(['start', 'cmd', '/c', cmd], shell=True)
        self.update_output("Opened a new terminal for Whive mining.")

    def download_and_extract_miner(self, url):
        miner_path = os.path.expanduser('~/cpuminer-opt-win-5.0.40')
        os.makedirs(miner_path, exist_ok=True)
        zip_path = os.path.join(miner_path, 'cpuminer-opt-win-5.0.40.zip')

        self.update_output("Downloading and extracting miner...")
        urllib.request.urlretrieve(url, zip_path)
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(path=miner_path)
        os.remove(zip_path)

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
