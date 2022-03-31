class Variables2 {
    public static void main(String[] args) {
        int ix = 1;
        int iy = 2;
        int iz = 3;
        int isum = ix + iy + iz;
        System.out.println("int_sum: " + isum);

        int imul = ix * iy * iz;
        System.out.println("int_mul: " + imul);

        long lx = 4;
        long ly = 5;
        long lz = 6;
        long lsum = lx + ly + lz;
        System.out.println("long_sum: " + lsum);

        long lmul = lx * ly * lz;
        System.out.println("long_mul: " + lmul);

        float fx = 7.0f;
        float fy = 8.0f;
        float fz = 9.0f;
        float fsum = fx + fy + fz;
        System.out.println("float_sum: " + fsum);

        float fmul = fx * fy * fz;
        System.out.println("float_mul: " + fmul);

        double dx = 10.0d;
        double dy = 11.0d;
        double dz = 12.0d;
        double dsum = dx + dy + dz;
        System.out.println("double_sum: " + dsum);

        double dmul = dx * dy * dz;
        System.out.println("double_mul: " + dmul);
    }
}