import User from "../../models/User.js";
import bcrypt from "bcryptjs";

// Create a new worker
export const createWorker = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check availability
        const existingUser = await User.findOne({ where: email ? { email } : { phone } });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email or phone already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const worker = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role: 'WORKER'
        });

        res.status(201).json({ success: true, worker });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create worker" });
    }
};

// Get all workers (Paginated)
export const getWorkers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await User.findAndCountAll({
            where: { role: 'WORKER' },
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            workers: rows,
            pagination: {
                total: count,
                page,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch workers" });
    }
};

// Get worker by ID
export const getWorkerById = async (req, res) => {
    try {
        const { id } = req.params;
        const worker = await User.findOne({
            where: { u_id: id, role: 'WORKER' },
            attributes: { exclude: ['password'] }
        });

        if (!worker) return res.status(404).json({ error: "Worker not found" });

        res.json({ success: true, worker });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch worker" });
    }
};

// Update worker
export const updateWorker = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, password } = req.body;

        const worker = await User.findOne({ where: { u_id: id, role: 'WORKER' } });
        if (!worker) return res.status(404).json({ error: "Worker not found" });

        if (name) worker.name = name;
        if (email) worker.email = email;
        if (phone) worker.phone = phone;
        if (password) {
            worker.password = await bcrypt.hash(password, 10);
        }

        await worker.save();

        res.json({ success: true, worker });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update worker" });
    }
};

// Delete worker
export const deleteWorker = async (req, res) => {
    try {
        const { id } = req.params;
        const worker = await User.findOne({ where: { u_id: id, role: 'WORKER' } });

        if (!worker) return res.status(404).json({ error: "Worker not found" });

        await worker.destroy();

        res.json({ success: true, message: "Worker deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete worker" });
    }
};
