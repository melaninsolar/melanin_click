import tkinter as tk
import os
import urllib.request
import tarfile
import threading
import subprocess
from PIL import Image, ImageTk  
import tkinter.messagebox as msgbox
import psutil
import zipfile
import requests

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
        url = "https://raw.githubusercontent.com/whiveio/whive/master/WHIVE_TERMS_AND_CONDITIONS.md"
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

        # Lightning (Lnd)
        self.install_lightning_button = tk.Button(frame, text="Install Lightning(Lnd)", command=self.install_lnd)
        self.install_lightning_button.grid(row=1, column=0, padx=10, pady=5)

        self.run_lightning_button = tk.Button(frame, text="Run Lightning(Lnd)", command=self.run_lnd)
        self.run_lightning_button.grid(row=1, column=1, padx=10, pady=5)

        # Whive Core
        self.install_whive_button = tk.Button(frame, text="Install Whive Core", command=self.install_whive)
        self.install_whive_button.grid(row=2, column=0, padx=10, pady=5)

        self.run_whive_button = tk.Button(frame, text="Run Whive Core", state='disabled', command=self.run_whive)
        self.run_whive_button.grid(row=2, column=1, padx=10, pady=5)

        # Whive CpuMiner section

        # New Whive Address button
        self.new_whive_address_button = tk.Button(frame, text="New Whive Address", command=self.get_whive_address, state='disabled')
        self.new_whive_address_button.grid(row=3, column=0, padx=10, pady=5)  

        self.whive_address_label = tk.Label(self, text="Whive Address: None")
        self.whive_address_label.pack()

        self.run_cpuminer_button = tk.Button(frame, text="Run Whive CpuMiner", command=self.run_whive_miner, state='disabled')
        self.run_cpuminer_button.grid(row=3, column=1, padx=10, pady=5)  


        self.whive_cli_path = os.path.join(os.path.expanduser('~'), "whive-core", "whive", "bin", "whive-cli")


        # Bitcoin Nerd Miner
        self.run_bitcoin_nerd_miner_button = tk.Button(frame, text="Run Bitcoin Nerd Miner", state='disabled')
        self.run_bitcoin_nerd_miner_button.grid(row=4, column=0, padx=10, pady=5, columnspan=2)

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
            # You might need to adjust the link here if there's a different binary or configuration for regtest
            self.install('bitcoin-regtest', "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-win64.zip")
        else:
            self.update_output("Insufficient storage space for Bitcoin. Please free up some space and try again.")

    def install_lnd(self):
        self.install('lnd', "https://github.com/lightningnetwork/lnd/releases/download/v0.17.0-beta.rc2/lnd-windows-amd64-v0.17.0-beta.rc2.zip")

    def install_whive(self):
        self.install('whive', "https://github.com/whiveio/whive/releases/download/v2.22.1/whive-2.22.1-win64.zip")


    def install(self, software, download_url):
        self.update_output(f"Installing {software}...")

        install_path = os.path.join(os.path.expanduser('~'), f"{software}-core")
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
        self.update_output("Extracting zip file...")  # Modify the message to indicate a zip file
        with zipfile.ZipFile(downloaded_file, 'r') as zip_ref:
            zip_ref.extractall(path=install_path)
        os.remove(downloaded_file)
        self.update_output(f"{software} installation complete!")
    
         # Enable the respective run buttons
        if software == 'whive':
            self.run_whive_button.config(state='normal')
        elif software.startswith('bitcoin'):
            self.run_bitcoin_button.config(state='normal')

        self.quit_button.config(state='normal')


    def run_whive(self):
        whive_path = os.path.join(os.path.expanduser('~'), "whive-core", "whive", "bin", "whive-qt.exe")
        self.run_software(whive_path)

    #def run_bitcoin(self):
        # Assuming the binary name is 'bitcoin-qt' for now
        #bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt.exe")
        #self.run_software(bitcoin_path)


    def run_bitcoin(self):
        bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt.exe")
        regtest_path = os.path.join(os.path.expanduser('~'), "bitcoin-regtest-core", "bitcoin-22.0", "bin", "bitcoin-qt.exe")

        if os.path.exists(bitcoin_path):
            self.run_software(bitcoin_path)
        elif os.path.exists(regtest_path):
            self.run_software(regtest_path)
        else:
            self.update_output("Bitcoin software not found. Please install first.")


    def run_lnd(self):
        lnd_path = os.path.join(os.path.expanduser('~'), "lnd-core", "lnd-windows-amd64-v0.17.0-beta.rc2", "lnd.exe")
        neutrino_args = [
            "--bitcoin.active",
            "--bitcoin.mainnet",
            "--bitcoin.node=neutrino",
            "--neutrino.addpeer=btcd-mainnet.lightning.computer",
            "--neutrino.addpeer=mainnet1-btcd.zaphq.io",
            "--neutrino.addpeer=mainnet2-btcd.zaphq.io",
            "--neutrino.addpeer=mainnet3-btcd.zaphq.io",
            "--neutrino.addpeer=mainnet4-btcd.zaphq.io",
            "--neutrino.feeurl=https://nodes.lightning.computer/fees/v1/btc-fee-estimates.json"
        ]
        self.run_software(lnd_path, *neutrino_args)

    def get_whive_address(self):
        try:
            address = subprocess.check_output([self.whive_cli_path, "getnewaddress"]).decode('utf-8').strip()
            self.update_output(f"New Whive Address: {address}")
            self.whive_address_label.config(text=f"Whive Address: {address}")
        except subprocess.CalledProcessError as e:
            self.update_output(f"Error fetching Whive address: {e}")

    def run_whive_miner(self):
        # Display the disclaimer
        disclaimer_text = ("Disclaimer: Running the CPU miner in Melanin Click for an extended period of time on your machine may result "
                       "in increased wear and tear, overheating, and decreased performance of your hardware. Prolonged mining operations "
                       "have been known to consume significant electrical resources and may potentially lead to hardware failure. We highly "
                       "recommend using a dedicated machine equipped with adequate cooling mechanisms for mining activities. This is a summary "
                       "of potential risks, and we encourage you to refer to the entire disclaimer for a comprehensive understanding of the terms and conditions.")

        agreement = msgbox.askyesno("Disclaimer", disclaimer_text)

    # Only proceed if the user clicks 'Yes'
        if not agreement:
            return

        address = self.whive_address_label.cget("text").split(":")[1].strip()
        minerd_path = os.path.expanduser('~/cpuminer-mc-yespower/minerd.exe')
        cmd = [minerd_path, "-a", "yespower", "-o", "stratum+tcp://206.189.2.17:3333", "-u", f"{address}.w1", "-t", "1"]
        
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        stdout, stderr = process.communicate()
        self.whive_output.insert(tk.END, stdout)
        self.whive_output.insert(tk.END, stderr)

    def run_software(self, software_path, *args):
        self.update_output(f"Running software from {software_path}")
        subprocess.Popen([software_path, *args])

    def display_help(self):
        # Placeholder: display some kind of help or open a help file. For this example, I'm just updating the output with a message.
        self.update_output("This is the help section. You can add instructions here or open a help file.")

    def update_output(self, message):
        self.output.config(state='normal')  # Enable text box
        self.output.insert('end', message + "\n")  # Insert new message
        self.output.config(state='disabled')  # Disable text box
        self.output.see('end')  # Scroll to end

app = Application()
app.mainloop()
