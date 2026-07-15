/**
 * Database Seed Script
 * Run: node src/utils/seed.js
 */
require('../config/env');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/env');

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Testimonial = require('../models/Testimonial');
const FAQ = require('../models/FAQ');
const Setting = require('../models/Setting');
const Blog = require('../models/Blog');
const Project = require('../models/Project');

const seed = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB for seeding...');

    const force = process.argv.includes('--force');

    // Safety check: don't wipe/re-seed a database that already has data.
    // This lets `seed.js` be run automatically on every deploy (e.g. via a
    // Pre-Deploy Command) without ever erasing real production data.
    // Pass --force (e.g. `node src/utils/seed.js --force`) to intentionally
    // wipe and reseed anyway.
    if (!force) {
      const existingUserCount = await User.countDocuments();
      if (existingUserCount > 0) {
        console.log(`Database already has data (${existingUserCount} user(s) found). Skipping seed.`);
        console.log('Run with --force to wipe and reseed anyway: node src/utils/seed.js --force');
        await mongoose.disconnect();
        process.exit(0);
      }
    }

    // Clear existing data
    await Promise.all([
      User.deleteMany(), Category.deleteMany(), Product.deleteMany(),
      Testimonial.deleteMany(), FAQ.deleteMany(), Setting.deleteMany(),
      Blog.deleteMany(), Project.deleteMany(),
    ]);
    console.log('Cleared existing data.');

    // ─── Admin User ────────────────────────────────────────────────────────────
    const adminUser = await User.create({
      name: 'BrickPro Admin',
      email: 'admin@brickpro.com',
      password: 'Admin@123456',
      role: 'super_admin',
      isActive: true,
    });
    console.log('Admin user created: admin@brickpro.com / Admin@123456');

    // ─── Categories ────────────────────────────────────────────────────────────
    const categories = await Category.insertMany([
      { name: 'Wire Cut Bricks', slug: 'wire-cut-bricks', description: 'Machine-cut bricks with uniform size and smooth surface', sortOrder: 1 },
      { name: 'Table Mould Bricks', slug: 'table-mould-bricks', description: 'Handmade traditional bricks with natural texture', sortOrder: 2 },
      { name: 'Fly Ash Bricks', slug: 'fly-ash-bricks', description: 'Eco-friendly bricks made from industrial fly ash', sortOrder: 3 },
      { name: 'Fire Bricks', slug: 'fire-bricks', description: 'High-temperature resistant refractory bricks', sortOrder: 4 },
      { name: 'Hollow Blocks', slug: 'hollow-blocks', description: 'Lightweight concrete hollow blocks for fast construction', sortOrder: 5 },
    ]);
    console.log('Categories seeded:', categories.length);

    // ─── Products ──────────────────────────────────────────────────────────────
    const products = await Product.insertMany([
      {
        name: 'Premium Wire Cut Brick',
        slug: 'premium-wire-cut-brick',
        category: categories[0]._id,
        description: 'Our premium wire cut bricks are manufactured using the latest wire cutting technology, ensuring uniform size, smooth surface, and superior strength. Ideal for exterior walls, boundary walls, and load-bearing structures.',
        shortDescription: 'Machine-precision bricks with smooth finish and superior strength',
        specs: {
          size: '9" × 4.5" × 3"',
          weight: '3.2 kg',
          type: 'Wire Cut',
          color: 'Red',
          finish: 'Smooth',
          strength: '7.5 N/mm²',
          waterAbsorption: '< 15%',
        },
        pricing: { retail: 8500, wholesale: 7800, bulk: 7200, unit: 'per 1000 bricks' },
        images: [{ url: '/placeholder-brick-1.jpg', alt: 'Premium Wire Cut Brick', isPrimary: true }],
        inStock: true,
        isFeatured: true,
        tags: ['wire cut', 'premium', 'smooth', 'exterior'],
        seoMeta: {
          title: 'Premium Wire Cut Bricks | BrickPro',
          description: 'Buy premium quality wire cut bricks at wholesale prices. Uniform size, smooth surface. Delivery across city.',
          keywords: ['wire cut bricks', 'premium bricks', 'buy bricks online'],
        },
      },
      {
        name: 'Standard Table Mould Brick',
        slug: 'standard-table-mould-brick',
        category: categories[1]._id,
        description: 'Traditional table mould bricks handcrafted by skilled artisans. Known for their natural texture, thermal properties, and cost-effectiveness. Perfect for interior walls, partition walls, and general construction.',
        shortDescription: 'Traditional handmade bricks with excellent thermal properties',
        specs: {
          size: '9" × 4.5" × 3"',
          weight: '3.5 kg',
          type: 'Table Mould',
          color: 'Red-Brown',
          finish: 'Textured',
          strength: '5 N/mm²',
          waterAbsorption: '< 20%',
        },
        pricing: { retail: 5500, wholesale: 4800, bulk: 4200, unit: 'per 1000 bricks' },
        images: [{ url: '/placeholder-brick-2.jpg', alt: 'Table Mould Brick', isPrimary: true }],
        inStock: true,
        isFeatured: true,
        tags: ['table mould', 'handmade', 'traditional', 'interior'],
        seoMeta: {
          title: 'Table Mould Bricks | Traditional Handmade Bricks | BrickPro',
          description: 'Quality table mould bricks for interior and general construction. Wholesale rates available.',
        },
      },
      {
        name: 'Eco Fly Ash Brick',
        slug: 'eco-fly-ash-brick',
        category: categories[2]._id,
        description: 'Manufactured from fly ash — a by-product of coal combustion — these bricks are eco-friendly, lightweight, and offer superior insulation. They comply with IS:12894 standards and are ideal for all types of construction.',
        shortDescription: 'Eco-friendly, lightweight bricks with superior insulation',
        specs: {
          size: '9" × 4.5" × 3"',
          weight: '2.8 kg',
          type: 'Fly Ash',
          color: 'Gray-White',
          finish: 'Smooth',
          strength: '10 N/mm²',
          waterAbsorption: '< 12%',
        },
        pricing: { retail: 6500, wholesale: 5800, bulk: 5200, unit: 'per 1000 bricks' },
        images: [{ url: '/placeholder-brick-3.jpg', alt: 'Fly Ash Brick', isPrimary: true }],
        inStock: true,
        isFeatured: true,
        tags: ['fly ash', 'eco-friendly', 'lightweight', 'insulation', 'IS:12894'],
        seoMeta: {
          title: 'Fly Ash Bricks | Eco-Friendly Construction | BrickPro',
          description: 'IS:12894 compliant fly ash bricks. Lightweight, strong, and eco-friendly. Bulk orders welcome.',
        },
      },
      {
        name: 'Heavy Duty Fire Brick',
        slug: 'heavy-duty-fire-brick',
        category: categories[3]._id,
        description: 'High-alumina fire bricks designed to withstand temperatures up to 1600°C. Used in furnaces, kilns, fireplaces, boilers, and industrial applications requiring extreme heat resistance.',
        shortDescription: 'Refractory bricks for extreme temperature applications up to 1600°C',
        specs: {
          size: '9" × 4.5" × 2.5"',
          weight: '3.8 kg',
          type: 'Fire Brick',
          color: 'Light Yellow',
          finish: 'Dense',
          strength: '15 N/mm²',
        },
        pricing: { retail: 18000, wholesale: 16000, bulk: 14500, unit: 'per 1000 bricks' },
        images: [{ url: '/placeholder-brick-4.jpg', alt: 'Fire Brick', isPrimary: true }],
        inStock: true,
        isFeatured: false,
        tags: ['fire brick', 'refractory', 'high temperature', 'furnace', 'kiln'],
        seoMeta: {
          title: 'Fire Bricks | Refractory Bricks | BrickPro',
          description: 'High-alumina fire bricks for furnaces, kilns, and industrial use. Withstand up to 1600°C.',
        },
      },
      {
        name: 'Concrete Hollow Block (6")',
        slug: 'concrete-hollow-block-6',
        category: categories[4]._id,
        description: 'Lightweight concrete hollow blocks that speed up construction while providing excellent sound and thermal insulation. Available in 4", 6", 8" sizes. Ideal for partition walls, boundary walls, and multi-storey construction.',
        shortDescription: 'Lightweight hollow blocks for fast, insulated construction',
        specs: {
          size: '16" × 8" × 6"',
          weight: '12 kg',
          type: 'Hollow Block',
          color: 'Gray',
          finish: 'Rough',
          strength: '5 N/mm²',
        },
        pricing: { retail: 28, wholesale: 24, bulk: 20, unit: 'per piece' },
        images: [{ url: '/placeholder-brick-5.jpg', alt: 'Hollow Block', isPrimary: true }],
        inStock: true,
        isFeatured: false,
        tags: ['hollow block', 'concrete', 'lightweight', 'partition', 'insulation'],
      },
    ]);
    console.log('Products seeded:', products.length);

    // ─── Testimonials ─────────────────────────────────────────────────────────
    await Testimonial.insertMany([
      {
        name: 'Rajesh Kumar',
        designation: 'Civil Engineer',
        company: 'Buildmax Constructions',
        customerType: 'builder',
        rating: 5,
        review: 'BrickPro has been our trusted partner for over 3 years. Their wire cut bricks are consistently uniform, and delivery is always on time. Their wholesale rates are the best in the city.',
        isApproved: true,
        isFeatured: true,
        sortOrder: 1,
      },
      {
        name: 'Sunita Sharma',
        designation: 'Homeowner',
        company: '',
        customerType: 'homeowner',
        rating: 5,
        review: 'Built my dream home using BrickPro bricks. The quality was outstanding and the team was very helpful in recommending the right brick type for different walls. Highly recommend!',
        isApproved: true,
        isFeatured: true,
        sortOrder: 2,
      },
      {
        name: 'Arvind Patel',
        designation: 'Purchase Manager',
        company: 'State PWD',
        customerType: 'govt_department',
        rating: 5,
        review: 'We rely on BrickPro for all our government construction projects. Their compliance with standards, bulk pricing, and reliable transport make them our preferred vendor.',
        isApproved: true,
        isFeatured: true,
        sortOrder: 3,
      },
      {
        name: 'Mohammad Raza',
        designation: 'Contractor',
        company: 'Raza Builders',
        customerType: 'contractor',
        rating: 4,
        review: 'Good quality bricks and prompt delivery. The fly ash bricks are lightweight and make construction faster. Pricing is fair for bulk orders.',
        isApproved: true,
        isFeatured: false,
      },
      {
        name: 'Priya Mehta',
        designation: 'Interior Designer',
        company: 'Mehta Design Studio',
        customerType: 'other',
        rating: 5,
        review: 'The exposed brick finish from BrickPro wire cut bricks is simply stunning. My clients love the natural texture and uniform color. Will definitely order again.',
        isApproved: true,
        isFeatured: false,
      },
    ]);
    console.log('Testimonials seeded.');

    // ─── FAQs ──────────────────────────────────────────────────────────────────
    await FAQ.insertMany([
      {
        question: 'What types of bricks do you supply?',
        answer: 'We supply Wire Cut Bricks, Table Mould Bricks, Fly Ash Bricks, Fire Bricks, and Concrete Hollow Blocks. Each type is suitable for different construction purposes. Our team can help you choose the right brick for your project.',
        category: 'Products',
        sortOrder: 1,
      },
      {
        question: 'What is the minimum order quantity?',
        answer: 'Our minimum order is 5,000 bricks for regular supply. For smaller quantities, we can accommodate orders of 1,000+ bricks at retail pricing. Bulk orders of 50,000+ bricks qualify for special bulk pricing.',
        category: 'Ordering',
        sortOrder: 1,
      },
      {
        question: 'Do you provide home/site delivery?',
        answer: 'Yes! We have our own fleet of tractor-trolleys and trucks for delivery across the city and surrounding areas. Delivery charges depend on the quantity and distance. Free delivery is available for orders above 25,000 bricks within city limits.',
        category: 'Delivery',
        sortOrder: 1,
      },
      {
        question: 'What are your payment terms for bulk orders?',
        answer: 'For bulk orders, we offer flexible payment terms: 50% advance and 50% on delivery for first-time buyers. Regular customers with established credit enjoy 30-day payment terms. We accept bank transfers, cheques, and UPI.',
        category: 'Payment',
        sortOrder: 1,
      },
      {
        question: 'Are your bricks ISI certified?',
        answer: 'Our Fly Ash Bricks comply with IS:12894 standards. Our Wire Cut Bricks meet IS:1077 requirements. We regularly get our bricks tested at certified labs and can provide test certificates on request.',
        category: 'Quality',
        sortOrder: 1,
      },
      {
        question: 'Can you supply bricks for government projects?',
        answer: 'Absolutely! We have extensive experience supplying to government departments, PWD, municipal corporations, and government contractors. We provide all required documentation including GST invoices, quality certificates, and test reports.',
        category: 'Services',
        sortOrder: 1,
      },
      {
        question: 'How long does delivery take after placing an order?',
        answer: 'Standard orders are delivered within 24-48 hours for in-city locations. For urgent requirements, we have an express delivery service (subject to availability). Large bulk orders may require 3-5 days scheduling.',
        category: 'Delivery',
        sortOrder: 2,
      },
      {
        question: 'Do you offer credit/wholesale accounts for dealers?',
        answer: 'Yes, we have a dedicated dealer/wholesale program. Registered dealers get preferential pricing, priority delivery, and credit terms. Contact our sales team or fill out the inquiry form to apply for a dealer account.',
        category: 'Ordering',
        sortOrder: 2,
      },
    ]);
    console.log('FAQs seeded.');

    // ─── Settings ─────────────────────────────────────────────────────────────
    await Setting.insertMany([
      { key: 'site_name', value: 'BrickPro', type: 'string', group: 'general', label: 'Site Name', isPublic: true },
      { key: 'site_tagline', value: 'Quality Bricks, Reliable Delivery', type: 'string', group: 'general', label: 'Tagline', isPublic: true },
      { key: 'contact_phone', value: '+91-9876543210', type: 'string', group: 'contact', label: 'Phone', isPublic: true },
      { key: 'contact_whatsapp', value: '+919876543210', type: 'string', group: 'contact', label: 'WhatsApp', isPublic: true },
      { key: 'contact_email', value: 'info@brickpro.com', type: 'string', group: 'contact', label: 'Email', isPublic: true },
      { key: 'contact_address', value: '123 Brick Market, Industrial Area, City - 400001', type: 'string', group: 'contact', label: 'Address', isPublic: true },
      { key: 'working_hours', value: 'Mon-Sat: 8AM - 7PM, Sun: 10AM - 4PM', type: 'string', group: 'contact', label: 'Working Hours', isPublic: true },
      { key: 'google_maps_embed', value: 'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d14733.43!2d72.877!3d19.076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1!5m2!1sen!2sin', type: 'string', group: 'general', label: 'Google Maps Embed URL', isPublic: true },
      { key: 'social_facebook', value: 'https://facebook.com/brickpro', type: 'string', group: 'social', label: 'Facebook', isPublic: true },
      { key: 'social_instagram', value: 'https://instagram.com/brickpro', type: 'string', group: 'social', label: 'Instagram', isPublic: true },
      { key: 'social_youtube', value: '', type: 'string', group: 'social', label: 'YouTube', isPublic: true },
      { key: 'years_in_business', value: '15', type: 'string', group: 'general', label: 'Years in Business', isPublic: true },
      { key: 'bricks_delivered', value: '500 Million+', type: 'string', group: 'general', label: 'Bricks Delivered', isPublic: true },
      { key: 'happy_customers', value: '10,000+', type: 'string', group: 'general', label: 'Happy Customers', isPublic: true },
      { key: 'seo_default_title', value: 'BrickPro | Premium Brick Trading & Distribution', type: 'string', group: 'seo', label: 'Default SEO Title', isPublic: false },
      { key: 'seo_default_description', value: 'BrickPro - Your trusted partner for quality bricks. Wire cut, fly ash, fire bricks & more. Wholesale & retail. Fast city-wide delivery.', type: 'string', group: 'seo', label: 'Default Meta Description', isPublic: false },
    ]);
    console.log('Settings seeded.');

    // ─── Blog Post ────────────────────────────────────────────────────────────
    await Blog.create({
      title: 'How to Choose the Right Brick for Your Construction Project',
      slug: 'how-to-choose-right-brick-construction',
      excerpt: 'Choosing the right brick type can make a significant difference in the durability, cost, and aesthetics of your building. This guide helps you understand the key differences between brick types.',
      content: `<h2>Understanding Your Options</h2>
<p>When starting any construction project, one of the most critical decisions is selecting the right type of brick. At BrickPro, we supply multiple varieties, each suited for specific applications.</p>

<h2>Wire Cut Bricks</h2>
<p>Wire cut bricks are manufactured using wire cutting technology, resulting in uniform dimensions and a smooth surface. They are ideal for:</p>
<ul>
  <li>Exterior walls and facades</li>
  <li>Load-bearing structures</li>
  <li>Areas requiring high compressive strength</li>
  <li>Exposed brick finishes</li>
</ul>
<p>These bricks offer consistent quality with strength values of 7.5 N/mm² or higher.</p>

<h2>Table Mould Bricks</h2>
<p>Traditional handmade bricks are the most economical option and are perfect for:</p>
<ul>
  <li>Interior partition walls</li>
  <li>Non-load-bearing applications</li>
  <li>Infill panels</li>
</ul>

<h2>Fly Ash Bricks</h2>
<p>Eco-friendly and IS:12894 compliant, fly ash bricks offer superior insulation and are lighter than traditional bricks. They're excellent for all construction types and help earn green building points.</p>

<h2>Fire Bricks</h2>
<p>For industrial applications involving high heat, fire bricks are essential. Use them in:</p>
<ul>
  <li>Furnaces and kilns</li>
  <li>Fireplaces and pizza ovens</li>
  <li>Industrial boilers</li>
</ul>

<h2>Conclusion</h2>
<p>Need help deciding? Our team at BrickPro is always available to advise you based on your project requirements, budget, and timeline. Contact us today for a free consultation.</p>`,
      author: adminUser._id,
      category: 'Construction Tips',
      tags: ['brick types', 'construction guide', 'wire cut', 'fly ash', 'building tips'],
      isPublished: true,
      publishedAt: new Date(),
      coverImage: '/placeholder-blog-1.jpg',
      seoMeta: {
        title: 'How to Choose the Right Brick | BrickPro Construction Guide',
        description: 'Learn how to choose between wire cut, fly ash, table mould, and fire bricks for your construction project. Expert guide by BrickPro.',
        keywords: ['right brick for construction', 'brick types guide', 'wire cut vs fly ash brick'],
      },
    });
    console.log('Sample blog post created.');

    // ─── Sample Projects ──────────────────────────────────────────────────────
    await Project.insertMany([
      {
        title: 'Greenfield Residential Township',
        slug: 'greenfield-residential-township',
        description: 'A 500-unit residential township project where BrickPro supplied over 15 million premium wire cut bricks. The project required strict quality compliance and scheduled batch deliveries over 18 months.',
        shortDescription: 'Supplied 15M+ wire cut bricks for a 500-unit residential township',
        images: [{ url: '/placeholder-project-1.jpg', alt: 'Greenfield Township', isPrimary: true }],
        customer: { name: 'Greenfield Developers', type: 'developer' },
        location: { city: 'Mumbai', state: 'Maharashtra', area: 'Thane' },
        bricksUsed: { quantity: 15000000, brickType: 'Premium Wire Cut Bricks' },
        completionDate: new Date('2023-06-01'),
        duration: '18 months',
        category: 'residential',
        highlights: ['15M+ bricks delivered', 'Zero quality rejections', 'On-time delivery for all 18 batches', 'Bulk pricing saved client ₹12 lakhs'],
        isFeatured: true,
        isPublished: true,
      },
      {
        title: 'Municipal School Block Expansion',
        slug: 'municipal-school-block-expansion',
        description: 'Expansion of 6 municipal school buildings across the city using BrickPro fly ash bricks. The project required IS-certified materials and government documentation.',
        shortDescription: 'Fly ash brick supply for 6 government school buildings',
        images: [{ url: '/placeholder-project-2.jpg', alt: 'School Expansion', isPrimary: true }],
        customer: { name: 'Municipal Corporation', type: 'govt' },
        location: { city: 'Mumbai', state: 'Maharashtra', area: 'Multiple zones' },
        bricksUsed: { quantity: 2000000, brickType: 'Eco Fly Ash Bricks' },
        completionDate: new Date('2024-03-01'),
        duration: '8 months',
        category: 'government',
        highlights: ['IS:12894 certified supply', 'Complete documentation support', 'Timely delivery across 6 sites'],
        isFeatured: true,
        isPublished: true,
      },
    ]);
    console.log('Sample projects created.');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nAdmin credentials:');
    console.log('  Email: admin@brickpro.com');
    console.log('  Password: Admin@123456');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
