+++
title = "Reading: 8-Bit and 16-Bit Hardware Still Being Built"
date = 2026-01-25
weight = 355721
tags = ["retro", "hardware", "8-bit", "reading"]
[taxonomies]
tags = ["retro", "hardware", "8-bit", "reading"]
+++

A link roundup, and a different kind of reading list. None of this is
professional infrastructure advice, and I would not deploy any of it. It is
here because the same engineering instincts apply to a machine with 64 KB of
memory, and because the people building this stuff are doing careful,
documented, verifiable work that is worth reading for its own sake.

**The FPGA recreations.** [ZX Spectrum
Next](https://www.specnext.com) is the most ambitious: an FPGA
implementation of a Z80 that stays compatible with the original while adding
HDMI, WiFi and solid-state storage, and whose current issue adds licensed
cores for the Sinclair QL and the Commodore 64. The interesting part is the
compatibility constraint, which is the same problem as running a legacy
workload and not breaking it.

[MiSTer](https://github.com/MiSTer-devel/Main_MiSTer) is the open-source
answer, running dozens of machines on a Terasic DE10-Nano board. The
[community forum](https://misterfpga.org) is where the real engineering
happens, and it is very much alive.

[MEGA65](https://mega65.org) is a real computer, not an emulator: a
twenty-first-century realisation of the Commodore C65 that never shipped,
running roughly forty times faster than a C64 while staying compatible. Real
video chip, real keyboard, dual SD slots. Paul Gardner-Stephen has been at
this for well over a decade and the documentation is exemplary.

[Analogue Pocket](https://www.analogue.co/pocket) takes a different approach,
using two FPGAs for hardware-accurate recreation rather than emulation, and
plays original Game Boy cartridges. Expensive, and opinionated about what
faithful means.

**Open hardware, cheap, and genuinely instructive.** The
[Agon Light](https://www.thebyteattic.com/p/agon.html) is an 8-bit machine
and microcontroller in one, with an eZ80 and a BBC BASIC, at
[around fifty euros from Olimex](https://www.olimex.com/Products/Retro-Computers/AgonLight2/open-source-hardware).
[Neo6502](https://www.olimex.com/Products/Retro-Computers/Neo6502/open-source-hardware)
is a 6502 with an RP2040 coprocessor for thirty euros.
[CERBERUS 2100](https://www.thebyteattic.com/p/cerberus-2100.html) has three
CPUs and three CPLDs programmable down to individual gates, which is the one
I would buy for teaching. And the
[ESP32-SBC](https://www.olimex.com/Products/Retro-Computers/ESP32-SBC-FabGL/open-source-hardware)
at fifteen euros adds VGA and a keyboard to any microcontroller, which is the
cheapest possible entry into writing an OS.

**Operating systems, which is where I would start.** [FreeDOS](https://www.freedos.org/)
is maintained, tested monthly, and the closest thing to a supported 16-bit DOS.
[AROS](http://www.aros.org/) is API-compatible with AmigaOS without
emulating it, the way Wine is to Windows. [FreeMiNT](https://freemint.github.io/)
is a multitasking kernel for the Atari ST.
[SymbOS](http://symbos.de/) is a preemptive graphical OS for Z80 machines and
now runs on the Spectrum Next. [KolibriOS](https://kolibrios.org/en/) is
written in assembly, fits on a 1.44 MB floppy, and still ships a GUI, a
browser and multitasking.

**The reading, if you want the actual engineering.** [Leaded
Solder](https://www.leadedsolder.com/) is the best of these, covering
hardware repair and bare-metal programming with real depth.
[Pagetable.com](https://www.pagetable.com/) does C64 and 128 reverse
engineering at a level that is genuinely difficult. [The MiSTer
wiki](https://github.com/MiSTer-devel/Wiki_MiSTer/wiki) is where the FPGA
architecture is explained properly, including the
[emulation versus replication](https://github.com/MiSTer-devel/Wiki_MiSTer/wiki/Why-FPGA)
distinction, which is the one that matters. [RC2014](https://rc2014.co.uk/) is
a modular Z80 computer built from scratch with a monthly newsletter.

For reference material, [Bitsavers](https://bitsavers.org/) has the manuals
and schematics for essentially everything, and
[Vintage Computer Federation](https://vcfed.org/) runs the events where the
hardware actually gets shown.

## Why this is on a site about infrastructure

The constraints are what make it worth reading. Sixty-four kilobytes, no
scheduler, no memory protection, and a bus you can count cycles on. Every
abstraction we build on modern hardware has an equivalent here, expressed
directly, and the design notes explain what it cost. The instinct that a
system should be legible enough that you can hold it in your head is not
modern, and reading about these machines is a good corrective for how much
we assume it comes for free.
