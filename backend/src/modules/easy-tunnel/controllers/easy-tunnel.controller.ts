import { FastifyRequest, FastifyReply } from 'fastify';
import { EasyTunnelService } from '../services/easy-tunnel.service';
import { WireguardManager } from '../../../services/wireguardManager';
import {
  fetchPaymentChannels,
  fetchPackages,
  validateLicenseKey,
  checkLicenseStatus,
  checkInvoiceStatus,
  checkSlugAvailability,
  requestNewLicense,
  releaseLicense
} from '../../../services/licenseClient';

export const EasyTunnelController = {
  async getTunnels(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await EasyTunnelService.getAllTunnels();
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async getTunnelById(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const data = await EasyTunnelService.getTunnelById(id);
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async setupTunnel(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { license_key, subdomain_slug, local_port, app_name } = (req.body as any) || {};
      if (!license_key || !subdomain_slug || !local_port || !app_name) {
        return reply.status(400).send({
          success: false,
          message: 'license_key, subdomain_slug, local_port, dan app_name wajib diisi.'
        });
      }

      const portNum = parseInt(String(local_port), 10);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        return reply.status(400).send({ success: false, message: 'Port lokal tidak valid (1-65535).' });
      }

      const data = await EasyTunnelService.setupTunnel({
        license_key,
        subdomain_slug,
        local_port: portNum,
        app_name
      });

      return reply.send({
        success: true,
        message: `Tunnel untuk "${app_name}" berhasil dikonfigurasi! Klik "Aktifkan" untuk memulai.`,
        data
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async startTunnel(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const result = await EasyTunnelService.startTunnel(id);
      return reply.send({ success: true, message: result.message });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async stopTunnel(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const result = await EasyTunnelService.stopTunnel(id);
      return reply.send({ success: true, message: result.message });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async diagnoseTunnel(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const data = await EasyTunnelService.getTunnelById(id);
      const result = await WireguardManager.diagnoseTunnel(data.slug);
      return reply.send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async deleteTunnel(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      await EasyTunnelService.removeTunnel(id);
      return reply.send({ success: true, message: 'Tunnel berhasil dihapus.' });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async editTunnel(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const { local_port, app_name } = (req.body as any) || {};
      const portNum = parseInt(String(local_port), 10);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        return reply.status(400).send({ success: false, message: 'Port lokal tidak valid.' });
      }

      const data = await EasyTunnelService.editTunnel(id, portNum, app_name);
      return reply.send({ success: true, message: 'Tunnel berhasil diperbarui.', data });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async setCustomDomain(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const { custom_domain } = (req.body as any) || {};
      if (!custom_domain) {
        return reply.status(400).send({ success: false, message: 'Custom domain wajib diisi.' });
      }

      const data = await EasyTunnelService.setCustomDomain(id, custom_domain);
      return reply.send({
        success: true,
        message: `Custom domain ${custom_domain} berhasil didaftarkan!`,
        data
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async removeCustomDomain(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const data = await EasyTunnelService.removeCustomDomain(id);
      return reply.send({ success: true, message: 'Custom domain berhasil dilepas.', data });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async checkWgInstalled(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const installed = WireguardManager.isWireGuardInstalled();
      return reply.send({
        success: true,
        installed,
        is_windows: WireguardManager.isWindows(),
        is_admin: WireguardManager.isWindows() ? WireguardManager.isAdmin() : true
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async installWg(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await WireguardManager.installWireGuard();
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async validateKey(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { key } = req.params as { key: string };
      const data = await validateLicenseKey(key);
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(400).send({ success: false, message: err.message });
    }
  },

  async checkSlug(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { slug } = req.params as { slug: string };
      const data = await checkSlugAvailability(slug);
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async getPackages(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await fetchPackages();
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async getPaymentChannels(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await fetchPaymentChannels();
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async buyLicense(req: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await requestNewLicense(req.body as any);
      return reply.send(data);
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async checkInvoice(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { invoice } = req.params as { invoice: string };
      const data = await checkInvoiceStatus(invoice);
      return reply.send(data);
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async checkLicense(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { key } = req.params as { key: string };
      const data = await checkLicenseStatus(key);
      return reply.send(data);
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  },

  async releaseLicenseKey(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { license_key } = (req.body as any) || {};
      if (!license_key) return reply.status(400).send({ success: false, message: 'license_key wajib diisi.' });
      const data = await releaseLicense(license_key);
      return reply.send(data);
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  }
};
