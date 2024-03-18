import tkinter as tk
import os
import urllib.request
import tarfile
import threading
import subprocess
from PIL import Image, ImageTk  
import tkinter.messagebox as msgbox
from tkinter import simpledialog, messagebox
import threading
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

        # Bitcoin Core Installation
        self.install_bitcoin_button = tk.Button(frame, text="Install Bitcoin Core", command=self.check_storage_and_install_bitcoin)
        self.install_bitcoin_button.grid(row=0, column=0, padx=10, pady=5)

        # Run Mainnet Bitcoin Core
        self.run_mainnet_button = tk.Button(frame, text="Run Full Bitcoin Node", command=self.run_mainnet)
        self.run_mainnet_button.grid(row=0, column=1, padx=10, pady=5) 

        # Run Pruned Bitcoin Node
        self.run_pruned_node_button = tk.Button(frame, text="Run Pruned Bitcoin Node", command=self.run_pruned_node)
        self.run_pruned_node_button.grid(row=0, column=2, padx=10, pady=5) 

        # Add a separator between Bitcoin Core and Lightning (Lnd)
        separator1 = tk.Frame(frame, height=2, bg="black", width=frame.winfo_width())
        separator1.grid(row=1, columnspan=3, pady=10, sticky='ew')

        # Lightning (Lnd)
        self.install_lightning_button = tk.Button(frame, text="Install Lightning(Lnd)", command=self.install_lnd)
        self.install_lightning_button.grid(row=1, column=0, padx=10, pady=5)

        self.run_lightning_button = tk.Button(frame, text="Run Lightning(Lnd)", command=self.run_lnd)
        self.run_lightning_button.grid(row=1, column=1, padx=10, pady=5)

        self.create_wallet_button = tk.Button(frame, text="Create Wallet", command=self.create_wallet)
        self.create_wallet_button.grid(row=1, column=2, padx=10, pady=5)

        self.unlock_wallet_button = tk.Button(frame, text="Unlock Wallet", command=self.unlock_wallet)
        self.unlock_wallet_button.grid(row=2, column=0, padx=10, pady=5)

        self.stop_lnd_button = tk.Button(frame, text="Stop LND", command=self.stop_lnd)
        self.stop_lnd_button.grid(row=2, column=1, padx=10, pady=5)  # Adjust grid positioning as needed

        # Add a separator between Lightning (Lnd) and Whive Core
        separator2 = tk.Frame(frame, height=2, bg="black", width=frame.winfo_width())
        separator2.grid(row=3, columnspan=3, pady=10, sticky='ew')

        # Whive Core
        self.install_whive_button = tk.Button(frame, text="Install Whive Core", command=self.install_whive)
        self.install_whive_button.grid(row=3, column=0, padx=10, pady=5)

        self.run_whive_button = tk.Button(frame, text="Run Whive Core", state='disabled', command=self.run_whive)
        self.run_whive_button.grid(row=3, column=1, padx=10, pady=5)

        # Whive CpuMiner section

        # New Whive Address button
        """ self.new_whive_address_button = tk.Button(frame, text="New Whive Address", command=self.get_whive_address, state='disabled')
        self.new_whive_address_button.grid(row=3, column=0, padx=10, pady=5)  """ 

        self.whive_address_label = tk.Label(self, text="Whive Address: None")
        self.whive_address_label.pack()

        self.run_cpuminer_button = tk.Button(frame, text="Run Whive CpuMiner", command=self.run_whive_miner)
        self.run_cpuminer_button.grid(row=4, column=1, padx=10, pady=5)  


        self.whive_cli_path = os.path.join(os.path.expanduser('~'), "whive-core", "whive", "bin", "whive-cli")

        # Add a separator between Whive Core and Bitcoin Nerd Miner
        separator3 = tk.Frame(frame, height=2, bg="black", width=frame.winfo_width())
        separator3.grid(row=5, columnspan=3, pady=10, sticky='ew')

        # Bitcoin Nerd Miner
        self.run_bitcoin_nerd_miner_button = tk.Button(frame, text="Run Bitcoin Nerd Miner", state='disabled')
        self.run_bitcoin_nerd_miner_button.grid(row=5, column=0, padx=10, pady=5, columnspan=3)

        

        # Help and Quit
        self.help_button = tk.Button(frame, text="Help", command=self.display_help)
        self.help_button.grid(row=6, column=0, padx=10, pady=5, columnspan=3)

        self.quit_button = tk.Button(frame, text="Quit", command=controller.quit)
        self.quit_button.grid(row=7, column=0, padx=10, pady=5, columnspan=3)

    def check_storage_and_install_bitcoin(self):
        s = os.statvfs('/')
        free_space = s.f_frsize * s.f_bavail / (10**9)  # free space in GB

        if free_space > 600:
            #self.install('bitcoin', "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-osx64.tar.gz")
            threading.Thread(target=self.install, args=('bitcoin', "https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-osx64.tar.gz")).start()
        elif free_space > 10:
            self.install_pruned_bitcoin()
        else:
            self.update_output("Insufficient storage space for Bitcoin. Please free up some space and try again.")

    def run_mainnet(self):
        # Define the mainnet path and execute it
        bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt")
        if not os.path.exists(bitcoin_path):
            bitcoin_path = "/Applications/Bitcoin-qt.app/Contents/MacOS/Bitcoin-qt"

        if not os.path.exists(bitcoin_path):
            self.update_output("Error: Could not find a valid Bitcoin installation.")
            return

        self.run_software(bitcoin_path)

    def create_bitcoin_conf(self, conf_path):
        #  configuration content
        content = """
         prune=550
         daemon=1
         """
    
        with open(conf_path, 'w') as file:
            file.write(content)


    def run_pruned_node(self):
        # Path to the bitcoin-qt executable
        pruned_bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt")
    
        # Path to the pruned node data directory
        pruned_data_dir = os.path.join(os.path.expanduser('~'), "pruned-node")

        # Path to the bitcoin.conf in the pruned node data directory
        bitcoin_conf_path = os.path.join(pruned_data_dir, "bitcoin.conf")
    
        # Create bitcoin.conf if it doesn't exist
        if not os.path.exists(bitcoin_conf_path):
            self.create_bitcoin_conf(bitcoin_conf_path)
            self.update_output("bitcoin.conf created in pruned-node directory.")

        # Check if bitcoin-qt exists
        if not os.path.exists(pruned_bitcoin_path):
            self.update_output("Error: Could not find the pruned Bitcoin node installation.")
            return

        # Command structure
        command = [pruned_bitcoin_path, f'--datadir={pruned_data_dir}']

        # Run the software and capture output for debugging
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()

        if process.returncode != 0:
            self.update_output("Error running pruned Bitcoin node.")
            self.update_output("STDOUT: " + stdout.decode())
            self.update_output("STDERR: " + stderr.decode())
        else:
            self.update_output("Pruned Bitcoin node started successfully.")

    def install_lnd(self):
        threading.Thread(target=self.install, args=('lnd', "https://github.com/lightningnetwork/lnd/releases/download/v0.17.0-beta.rc2/lnd-darwin-arm64-v0.17.0-beta.rc2.tar.gz")).start()

    def create_whive_conf(self):
        conf_dir = os.path.expanduser('~/Library/Application Support/Whive')
        os.makedirs(conf_dir, exist_ok=True)

        rpc_username, rpc_password = self.generate_random_credentials()
        conf_content = f"""
        server=1
        daemon=1
        rpcuser={rpc_username}
        rpcpassword={rpc_password}
        rpcport=1867
        """

        conf_path = os.path.join(conf_dir, "whive.conf")
        with open(conf_path, "w") as conf_file:
            conf_file.write(conf_content)

        self.update_output("whive.conf created/updated successfully in the default folder.")

    @staticmethod
    def generate_random_credentials():
        alphabet = string.ascii_letters + string.digits
        username = ''.join(secrets.choice(alphabet) for i in range(8))
        password = ''.join(secrets.choice(alphabet) for i in range(16))
        return username, password

    def get_whive_address(self):
        try:
            # Run the whive-cli command to create a new address
            process = subprocess.Popen([self.whive_cli_path, 'getnewaddress'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout, stderr = process.communicate()

            # Check if the process ran successfully
            if process.returncode == 0:
                new_address = stdout.decode().strip()
                self.update_output(f"New Whive Address: {new_address}")
                self.whive_address_label.config(text=f"Whive Address: {new_address}")
            else:
                self.update_output(f"Error creating new Whive address: {stderr.decode()}")
        except Exception as e:
            self.update_output(f"Error creating new Whive address: {str(e)}")



    def install_whive(self):
        threading.Thread(target=self.install, args=('whive', "https://github.com/whiveio/whive/releases/download/22.2.2/whive-22.2.2-osx64.tar.gz")).start()

    def schedule_update_output(self, message):
        self.after(0, self.update_output, message)

    def install(self, software, download_url):
        self.update_output(f"Installing {software}...")

        install_path = os.path.join(os.path.expanduser('~'), f"{software}-core")
        downloaded_file = os.path.join(install_path, f"{software}.tar.gz")

        # Create installation directory if it doesn't exist
        os.makedirs(install_path, exist_ok=True)
        self.update_output(f"Created installation directory at {install_path}")

        # Download the file
        self.update_output(f"Downloading {software} from {download_url}")
        urllib.request.urlretrieve(download_url, downloaded_file)

        """ # Extract the tarball and delete it
        self.update_output("Extracting tarball...")
        with tarfile.open(downloaded_file, "r:gz") as tar:
            tar.extractall(path=install_path)
        os.remove(downloaded_file)
        self.update_output(f"{software} installation complete!") """

        self.schedule_update_output("Extracting tarball...")
        with tarfile.open(downloaded_file, "r:gz") as tar:
            tar.extractall(path=install_path)
        os.remove(downloaded_file)
        self.schedule_update_output(f"{software} installation complete!")
        
        # Enable the respective run buttons
        if software == 'whive':
            self.run_whive_button.config(state='normal')
        elif software.startswith('bitcoin'):
            self.run_bitcoin_button.config(state='normal')

        self.quit_button.config(state='normal')

    def run_whive(self):
        whive_path = os.path.join(os.path.expanduser('~'), "whive-core", "whive", "bin", "whive-qt")
        self.run_software(whive_path)

    def run_bitcoin(self):
        # Assuming the binary name is 'bitcoin-qt' for now
        bitcoin_path = os.path.join(os.path.expanduser('~'), "bitcoin-core", "bitcoin-22.0", "bin", "bitcoin-qt")
        self.run_software(bitcoin_path)

    def run_lnd(self):
        lnd_path = os.path.join(os.path.expanduser('~'), "lnd-core", "lnd-darwin-arm64-v0.17.0-beta.rc2", "lnd")
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
        #self.run_software(lnd_path, *neutrino_args)
        cmd = ' '.join([lnd_path] + neutrino_args)
        escaped_cmd = cmd.replace('"', r'\"')  # Escape any double quotes in the command
        subprocess.Popen(['osascript', '-e', f'tell app "Terminal" to do script "{escaped_cmd}"'])

    def is_lnd_running(self):
        try:
            # Use 'pgrep' or a similar command to check if the lnd process is running
            subprocess.check_output(['pgrep', 'lnd'])
            return True
        except subprocess.CalledProcessError:
            return False

    def update_button_states(self):
        if self.is_lnd_running():
            self.create_button.config(state=tk.NORMAL)
            self.unlock_button.config(state=tk.NORMAL)
        else:
            self.create_button.config(state=tk.DISABLED)
            self.unlock_button.config(state=tk.DISABLED)
    
    def start_checking_lnd_status(self):
        self.update_button_states()
        # Check every 5 seconds (you can adjust this interval)
        self.after(5000, self.start_checking_lnd_status)

    """ def run_lnd(self):
        lnd_thread = threading.Thread(target=self.run_lnd_in_thread)
        lnd_thread.start() """

    """ def get_whive_address(self):
        try:
            address = subprocess.check_output([self.whive_cli_path, "getnewaddress"]).decode('utf-8').strip()
            self.update_output(f"New Whive Address: {address}")
            self.whive_address_label.config(text=f"Whive Address: {address}")
        except subprocess.CalledProcessError as e:
            self.update_output(f"Error fetching Whive address: {e}") """
    

    def create_wallet(self):
        lncli_path = os.path.join(os.path.expanduser('~'), "lnd-core", "lnd-darwin-arm64-v0.17.0-beta.rc2", "lncli")
        """ try:
            result = subprocess.check_output([lncli_path, "create"], stderr=subprocess.STDOUT).decode('utf-8')
            self.update_output(result)
        except subprocess.CalledProcessError as e:
            self.update_output(f"Error: {e.output.decode('utf-8')}") """
        cmd = f'{lncli_path} create'
        subprocess.Popen(['osascript', '-e', f'tell app "Terminal" to do script "{cmd}"'])


    def unlock_wallet(self):
        lncli_path = os.path.join(os.path.expanduser('~'), "lnd-core", "lnd-darwin-arm64-v0.17.0-beta.rc2", "lncli")
        """ try:
            result = subprocess.check_output([lncli_path, "unlock"], stderr=subprocess.STDOUT).decode('utf-8')
            self.update_output(result)
        except subprocess.CalledProcessError as e:
            self.update_output(f"Error: {e.output.decode('utf-8')}") """
        cmd = f'{lncli_path} unlock'
        subprocess.Popen(['osascript', '-e', f'tell app "Terminal" to do script "{cmd}"'])
    
    def stop_lnd(self):
        lncli_path = os.path.join(os.path.expanduser('~'), "lnd-core", "lnd-darwin-arm64-v0.17.0-beta.rc2", "lncli")
        try:
            result = subprocess.check_output([lncli_path, "stop"], stderr=subprocess.STDOUT).decode('utf-8')
            self.update_output(result)
        except subprocess.CalledProcessError as e:
            self.update_output(f"Error: {e.output.decode('utf-8')}")

    def read_from_process(self, process, output_widget):
            while True:
                line = process.stdout.readline()
                if line:
                    output_widget.insert(tk.END, line)
                else:
                    break

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

        # Prompt the user to enter their Whive address
        address = simpledialog.askstring("Input", "Please enter your Whive address:")

        # Continuously ask for the address until a valid address is provided
        while not address:
            messagebox.showwarning("Warning", "Please provide a valid Whive address.")
            address = simpledialog.askstring("Input", "Please enter your Whive address:")

        self.update_output(f"Whive Address: {address}")
        self.whive_address_label.config(text=f"Whive Address: {address}")

        minerd_path = os.path.expanduser('~/cpuminer-opt-mac/cpuminer-sse2')

        # Verify the path to the minerd exists
        if not os.path.exists(minerd_path):
            self.update_output("Miner executable not found. Downloading and extracting...")
            download_url = "https://github.com/rplant8/cpuminer-opt-rplant/releases/download/5.0.36/cpuminer-opt-mac.tar.gz"
            self.download_and_extract_miner(download_url)

        cmd = [minerd_path, "-a", "yespower", "-o", "stratum+tcp://206.189.2.17:3333", "-u", f"{address}.w1", "-t", "2"]

        # Print the command for debugging
        print("Executing:", " ".join(cmd))

        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=os.path.dirname(minerd_path), bufsize=1, universal_newlines=True)

        # Use a thread to read the output of the miner and update the GUI in real-time
        #threading.Thread(target=read_from_process, args=(process, self.whive_output)).start()
        threading.Thread(target=self.read_from_process, args=(process, self.output)).start()

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
        # Assuming you have a Text widget or similar in your GUI to display messages
        #self.output_text_widget.insert(tk.END, message + "\n")
        #self.output_text_widget.yview(tk.END)  # Scroll to the end

app = Application()
app.mainloop()

